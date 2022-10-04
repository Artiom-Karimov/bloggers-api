import { Router, Request, Response } from 'express'

import BlogService from '../../logic/blogService'
import { blogValidation, postValidation } from '../validation/bodyValidators'
import { validationMiddleware } from '../middlewares/validationMiddleware'
import QueryRepository from '../../data/repositories/queryRepository'
import GetBlogsQueryParams from '../models/getBlogsQueryParams'
import GetPostsQueryParams from '../models/getPostsQueryParams'
import PostService from '../../logic/postService'
import { PostInputModel } from '../../logic/models/postModel'
import { basicAuthMiddleware, bearerAuthMiddleware } from '../middlewares/authenticationMiddleware'

export default class BlogRouter {
    public readonly router: Router
    private readonly blogs: BlogService
    private readonly posts: PostService
    private readonly queryRepo: QueryRepository

    constructor() {
        this.router = Router()
        this.blogs = new BlogService()
        this.posts = new PostService()
        this.queryRepo = new QueryRepository()
        this.setRoutes()
    }

    private setRoutes() {
        this.router.get('/', async (req:Request, res:Response) => {
            const query = new GetBlogsQueryParams(req.query)
            const result = await this.queryRepo.getBlogs(
                query.searchNameTerm, query.pageNumber, query.pageSize, query.sortBy, query.sortDirection
            )
            res.status(200).send(result)
        })

        this.router.get('/:blogId/posts', async (req:Request, res:Response) => {
            const query = new GetPostsQueryParams(req.query)
            const result = await this.queryRepo.getBlogPosts(
                query.pageNumber, query.pageSize, query.sortBy, query.sortDirection, req.params.blogId
            )
            if(!result) {
                res.sendStatus(404)
                return
            }
            res.status(200).send(result)
        })

        this.router.get('/:id', async (req:Request, res:Response) => {
            const blog = await this.blogs.get(req.params.id)
            if(blog === undefined)
                res.send(404)
            else
                res.status(200).send(blog)
        })

        this.router.post('/',
            basicAuthMiddleware,
            blogValidation,
            validationMiddleware,
        async (req:Request, res:Response) => {
            const created = await this.blogs.create({ name:req.body.name, youtubeUrl:req.body.youtubeUrl })
            if(created) res.status(201).send(created)
            else res.send(404)
        })

        this.router.post('/:blogId/posts', 
            basicAuthMiddleware,
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
            basicAuthMiddleware,
            blogValidation,
            validationMiddleware,
        async (req:Request,res:Response) => {
            const blog = await this.blogs.get(req.params.id)
            if(blog === undefined)
                res.send(404)
            else {
                const updated = await this.blogs.update(req.params.id, { name:req.body.name, youtubeUrl:req.body.youtubeUrl })
                res.send(updated? 204 : 500)
            }
        })

        this.router.delete('/:id', 
            basicAuthMiddleware,
            async (req:Request,res:Response) => {
            if(await this.blogs.delete(req.params.id))
                res.send(204)
            else
                res.send(404)
        })
    }
}