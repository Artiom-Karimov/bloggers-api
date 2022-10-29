import { Router, Request, Response } from 'express'

import BlogService from '../../logicLayer/services/blogService'
import { blogValidation, postValidation } from '../validation/bodyValidators'
import { validationMiddleware } from '../middlewares/validationMiddleware'
import { IBlogPostQueryRepository } from '../interfaces/blogPostQueryRepository'
import GetBlogsQueryParams from '../models/queryParams/getBlogsQueryParams'
import GetPostsQueryParams from '../models/queryParams/getPostsQueryParams'
import PostService from '../../logicLayer/services/postService'
import AuthMiddlewareProvider from "../middlewares/authMiddlewareProvider";
import { inject, injectable } from 'inversify'
import { Types } from '../../inversifyTypes'

@injectable()
export default class BlogRouter {
    public readonly router: Router

    constructor(
        @inject(Types.BlogService) private readonly blogs:BlogService,
        @inject(Types.PostService) private readonly posts:PostService,
        @inject(Types.BlogPostQueryRepository) private readonly queryRepo:IBlogPostQueryRepository,
        @inject(Types.AuthMiddlewareProvider) private readonly authProvider:AuthMiddlewareProvider) {
            this.router = Router()
            this.setRoutes()
    }

    private setRoutes() {
        this.router.get('/', async (req:Request, res:Response) => {
            const query = new GetBlogsQueryParams(req.query)
            const result = await this.queryRepo.getBlogs(query)
            res.status(200).send(result)
        })

        this.router.get('/:blogId/posts', 
        this.authProvider.optionalBearerAuthMiddleware,
        async (req:Request, res:Response) => {
            const query = new GetPostsQueryParams(req.query, req.headers.userId as string|undefined)
            const result = await this.queryRepo.getBlogPosts(req.params.blogId,query)
            if(!result) {
                res.sendStatus(404)
                return
            }
            res.status(200).send(result)
        })

        this.router.get('/:id', async (req:Request, res:Response) => {
            const blog = await this.blogs.get(req.params.id)
            if(blog === undefined)
                res.sendStatus(404)
            else
                res.status(200).send(blog)
        })

        this.router.post('/',
            this.authProvider.basicAuthMiddleware,
            blogValidation,
            validationMiddleware,
        async (req:Request, res:Response) => {
            const created = await this.blogs.create({ name:req.body.name, youtubeUrl:req.body.youtubeUrl })
            if(created) res.status(201).send(created)
            else res.sendStatus(404)
        })

        this.router.post('/:blogId/posts', 
            this.authProvider.basicAuthMiddleware,
            postValidation,
            validationMiddleware,
        async (req:Request, res:Response) => {
            const blog = await this.blogs.get(req.params.blogId)
            if(!blog) {
                res.sendStatus(404)
                return
            }
            const created = await this.posts.create({
                title: req.body.title,
                shortDescription: req.body.shortDescription,
                content: req.body.content,
                blogId: blog.id,
                blogName: blog.name
            })
            if(!created) {
                res.sendStatus(500)
                return
            }
            res.status(201).send(created)
        })

        this.router.put('/:id',
            this.authProvider.basicAuthMiddleware,
            blogValidation,
            validationMiddleware,
        async (req:Request,res:Response) => {
            const blog = await this.blogs.get(req.params.id)
            if(blog === undefined)
                res.sendStatus(404)
            else {
                const updated = await this.blogs.update(req.params.id, { name:req.body.name, youtubeUrl:req.body.youtubeUrl })
                res.sendStatus(updated? 204 : 500)
            }
        })

        this.router.delete('/:id', 
            this.authProvider.basicAuthMiddleware,
            async (req:Request,res:Response) => {
            if(await this.blogs.delete(req.params.id))
                res.sendStatus(204)
            else
                res.sendStatus(404)
        })
    }
}