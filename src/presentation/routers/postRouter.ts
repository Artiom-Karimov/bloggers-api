import { Router, Request, Response } from 'express'
import { body, CustomValidator } from "express-validator";

import PostService from '../../logic/services/postService'
import { validationMiddleware } from '../middlewares/validationMiddleware'
import { commentValidation, postValidation } from '../validation/bodyValidators'
import { APIErrorResult } from '../validation/apiErrorResultFormatter'
import BlogService from '../../logic/services/blogService';
import GetPostsQueryParams from '../models/queryParams/getPostsQueryParams';
import { BlogPostQueryRepository } from '../interfaces/blogPostQueryRepository';
import AuthMiddlewareProvider from "../middlewares/authMiddlewareProvider";
import GetCommentsQueryParams from '../models/queryParams/getCommentsQueryParams';
import { CommentQueryRepository } from '../interfaces/commentQueryRepository';
import CommentService from '../../logic/services/commentService';
import { CommentCreateModel } from '../../logic/models/commentModel';

const blogIdErrorMessage = 'blogId should be an existing blog id'
const blogNotFoundResult = new APIErrorResult([{message:blogIdErrorMessage,field:'blogId'}])

export default class PostRouter {
    public readonly router: Router
    private readonly posts: PostService
    private readonly blogs: BlogService
    private readonly queryRepo: BlogPostQueryRepository
    private readonly comments: CommentService
    private readonly commentQueryRepo: CommentQueryRepository
    private authProvider: AuthMiddlewareProvider

    constructor(
        posts:PostService,
        blogs:BlogService,
        comments:CommentService,
        queryRepo:BlogPostQueryRepository,
        commentQueryRepo:CommentQueryRepository,
        authProvider:AuthMiddlewareProvider
        ) {
        this.posts = posts
        this.blogs = blogs
        this.comments = comments
        this.queryRepo = queryRepo
        this.commentQueryRepo = commentQueryRepo
        this.authProvider = authProvider
        this.router = Router()
        this.setRoutes()
        this.setCommentRoutes()
    }

    private setRoutes() {
        this.router.get('/', async (req:Request, res:Response) => {
            const query = new GetPostsQueryParams(req.query)
            const result = await this.queryRepo.getPosts(query)
            res.status(200).send(result)
        })

        this.router.get('/:id', async (req:Request, res:Response) => {
            const post = await this.posts.get(req.params.id)
            if(post === undefined)
                res.sendStatus(404)
            else
                res.status(200).send(post)
        })

        this.router.post('/',
            this.authProvider.basicAuthMiddleware,
            postValidation, this.blogIdValidation,
            validationMiddleware,
        async (req:Request, res:Response) => {
            const blog = await this.blogs.get(req.body.blogId)
            if(!blog) { 
                res.sendStatus(404)
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
            else res.sendStatus(404)
        })

        this.router.put('/:id',
            this.authProvider.basicAuthMiddleware,
            postValidation, this.blogIdValidation,
            validationMiddleware,
        async (req:Request,res:Response) => {
            const post = await this.posts.get(req.params.id)
            if(post === undefined)
                res.sendStatus(404)
            else {
                const blog = await this.blogs.get(req.body.blogId)
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
            this.authProvider.basicAuthMiddleware,
        async (req:Request,res:Response) => {
            const deleted = await this.posts.delete(req.params.id)
            res.sendStatus(deleted? 204 : 404)
        })
    }

    private setCommentRoutes() {
        this.router.get('/:postId/comments',
        async (req:Request,res:Response) => {
            const query = new GetCommentsQueryParams(req.query,req.params.postId)
            const post = await this.posts.get(query.postId)
            if(!post) {
                res.sendStatus(404)
                return
            }
            const page = await this.commentQueryRepo.get(query)
            res.status(200).send(page)
        })

        this.router.post('/:postId/comments', 
            this.authProvider.bearerAuthMiddleware,
        commentValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            const post = await this.posts.get(req.params.postId)
            if(!post) {
                res.sendStatus(404)
                return
            }

            const data:CommentCreateModel = {
                postId: post.id,
                userId: req.headers.userId as string,
                userLogin: req.headers.userLogin as string,
                content: req.body.content
            }

            const created = await this.comments.create(data)
            if(created) {
                const retrieved = await this.commentQueryRepo.getById(created)
                if(retrieved) {
                    res.status(201).send(retrieved)
                    return
                }
                res.sendStatus(500)
            }
        })
    }

    private blogIdValidator: CustomValidator = value => {
        return this.blogs.get(value).then((result) => {
            if(!result) return Promise.reject(blogIdErrorMessage)
        })
    }
    private blogIdValidation = body('blogId').custom(this.blogIdValidator)
}