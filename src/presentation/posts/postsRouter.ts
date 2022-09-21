import { Router, Request, Response } from 'express'
import { Blogs } from '../../data/blogs/blogs'
import { Posts } from '../../data/posts/posts'
import { authorizationMiddleware } from '../authorizationMiddleware'
import { validationMiddleware } from '../validation/validationMiddleware'
import { titleValidation, shortDescriptionValidation, contentValidation, blogIdValidation } from '../validation/postValidation'
import { APIErrorResult } from '../validation/apiErrorResultFormatter'

const blogNotFoundResult = new APIErrorResult([{message:'blog does not exist',field:'blogId'}])

let posts: Posts
let blogs: Blogs

const router = Router()

export const setupPostsRouter = (postRepository: Posts,blogRepository: Blogs): Router => {
    posts = postRepository
    blogs = blogRepository
    return router
}

router.get('/', (req:Request, res:Response) => {
    res.status(200).send(posts.getAll())
})

router.get('/:id', (req:Request, res:Response) => {
    const post = posts.getById(req.params.id)
    if(post === undefined)
        res.send(404)
    else
        res.status(200).send(post)
})

router.post('/',
    authorizationMiddleware,
    titleValidation, shortDescriptionValidation, contentValidation, blogIdValidation,
    validationMiddleware,
    (req:Request, res:Response) => {
        const blog = blogs.getById(req.body.blogId)
        if(blog === undefined)
            res.status(400).send(blogNotFoundResult)
        else {
            res.status(201).send(posts.create({ 
                title: req.body.title,
                shortDescription: req.body.shortDescription,
                content: req.body.content,
                blogId: req.body.blogId,
                blogName: blog.name
            }))
        }
})

router.put('/:id',
    authorizationMiddleware,
    titleValidation, shortDescriptionValidation, contentValidation, blogIdValidation,
    validationMiddleware,
    (req:Request,res:Response) => {
        const post = posts.getById(req.params.id)
        if(post === undefined)
            res.send(404)
        else {
            const blog = blogs.getById(req.body.blogId)
            if(blog === undefined)
                res.status(400).send(blogNotFoundResult)
            else {
                posts.update(req.params.id, { 
                    title: req.body.title,
                    shortDescription: req.body.shortDescription,
                    content: req.body.content,
                    blogId: req.body.blogId,
                    blogName: blog.name
                })
                res.send(204)
            }
        }
    })

router.delete('/:id', 
    authorizationMiddleware,
    (req:Request,res:Response) => {
    if(posts.delete(req.params.id))
        res.send(204)
    else
        res.send(404)
})