import { Router, Request, Response } from 'express'
import { PostRepository } from '../../data/posts/postRepository'
import { authorizationMiddleware } from '../authorizationMiddleware'
import { validationMiddleware } from '../validation/validationMiddleware'
import { titleValidation, shortDescriptionValidation, contentValidation } from '../validation/postValidation'
import { APIErrorResult } from '../validation/apiErrorResultFormatter'
import { body, CustomValidator } from "express-validator";

const blogIdErrorMessage = 'blogId should be an existing blog id'
const blogNotFoundResult = new APIErrorResult([{message:blogIdErrorMessage,field:'blogId'}])

export class PostsRouter {
    public readonly router: Router
    private readonly posts: PostRepository

    constructor(posts:PostRepository) {
        this.posts = posts
        this.router = Router()
        this.setRoutes()
    }

    private setRoutes() {
        this.router.get('/', async (req:Request, res:Response) => {
            res.status(200).send(await this.posts.getAll())
        })

        this.router.get('/:id', async (req:Request, res:Response) => {
            const post = await this.posts.get(req.params.id)
            if(post === undefined)
                res.send(404)
            else
                res.status(200).send(post)
        })

        this.router.post('/',
            authorizationMiddleware,
            titleValidation, shortDescriptionValidation, contentValidation, this.blogIdValidation,
            validationMiddleware,
        async (req:Request, res:Response) => {
            const blog = await this.posts.getBlog(req.body.blogId)
            if(!blog) { 
                res.send(404)
                return;
            }
            const created = await this.posts.create({
                title: req.body.title,
                shortDescription: req.body.shortDescription,
                content: req.body.content,
                blogId: req.body.blogId,
                blogName: blog.name
                })
            if(created) res.status(201).send(created)
            else res.send(404)
        })

        this.router.put('/:id',
            authorizationMiddleware,
            titleValidation, shortDescriptionValidation, contentValidation, this.blogIdValidation,
            validationMiddleware,
        async (req:Request,res:Response) => {
            const post = await this.posts.get(req.params.id)
            if(post === undefined)
                res.send(404)
            else {
                const blog = await this.posts.getBlog(req.body.blogId)
                if(blog === undefined)
                    res.status(400).send(blogNotFoundResult)
                else {
                    const updated = await this.posts.update(req.params.id, { 
                        title: req.body.title,
                        shortDescription: req.body.shortDescription,
                        content: req.body.content,
                        blogId: req.body.blogId,
                        blogName: blog.name
                    })
                    res.send(updated? 204 : 500)
                }
            }
        })

        this.router.delete('/:id', 
            authorizationMiddleware,
        async (req:Request,res:Response) => {
            const deleted = await this.posts.delete(req.params.id)
            res.send(deleted? 204 : 404)
        })
    }

    private blogIdValidator: CustomValidator = value => {
        return this.posts.getBlog(value).then((result) => {
            if(!result) return Promise.reject(blogIdErrorMessage)
        })
    }
    private blogIdValidation = body('blogId').custom(this.blogIdValidator)
}