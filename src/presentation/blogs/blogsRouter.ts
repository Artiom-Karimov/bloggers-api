import { Router, Request, Response } from 'express'

import { Blogs } from '../../data/blogs/blogs'
import { nameValidation, youtubeUrlValidation } from '../validation/blogValidation'
import { authorizationMiddleware } from '../authorizationMiddleware'
import { validationMiddleware } from '../validation/validationMiddleware'

let blogs: Blogs
const router = Router()

export const setupBlogsRouter = (blogRepository: Blogs): Router => {
    blogs = blogRepository
    return router
}

router.get('/', (req:Request, res:Response) => {
    res.status(200).send(blogs.getAll())
})

router.get('/:id', (req:Request, res:Response) => {
    const blog = blogs.getById(req.params.id)
    if(blog === undefined)
        res.send(404)
    else
        res.status(200).send(blog)
})

router.post('/',
    authorizationMiddleware,
    nameValidation, youtubeUrlValidation,
    validationMiddleware,
    (req:Request, res:Response) => {
        res.status(201).send(blogs.create({ name:req.body.name, youtubeUrl:req.body.youtubeUrl }))
})

router.put('/:id',
    authorizationMiddleware,
    nameValidation, youtubeUrlValidation,
    validationMiddleware,
    (req:Request,res:Response) => {
        const blog = blogs.getById(req.params.id)
        if(blog === undefined)
            res.send(404)
        else {
            blogs.update(req.params.id, { name:req.body.name, youtubeUrl:req.body.youtubeUrl })
            res.send(204)
        }
    })

router.delete('/:id', 
    authorizationMiddleware,
    (req:Request,res:Response) => {
    if(blogs.delete(req.params.id))
        res.send(204)
    else
        res.send(404)
})