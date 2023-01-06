import { Router, Request, Response } from 'express'
import { body, CustomValidator } from "express-validator";

import PostService from '../../logicLayer/services/postService'
import { validationMiddleware } from '../middlewares/validationMiddleware'
import { commentValidation, likeStatusValidation, postValidation } from '../validation/bodyValidators'
import { APIErrorResult } from '../validation/apiErrorResultFormatter'
import BlogService from '../../logicLayer/services/blogService';
import GetPostsQueryParams from '../models/queryParams/getPostsQueryParams';
import { IBlogPostQueryRepository } from '../interfaces/blogPostQueryRepository';
import AuthMiddlewareProvider from "../middlewares/authMiddlewareProvider";
import GetCommentsQueryParams from '../models/queryParams/getCommentsQueryParams';
import { ICommentQueryRepository } from '../interfaces/commentQueryRepository';
import CommentService from '../../logicLayer/services/commentService';
import { CommentCreateModel } from '../../logicLayer/models/commentModel';
import { inject, injectable } from 'inversify';
import { Types } from "../../inversifyTypes"

const blogIdErrorMessage = 'blogId should be an existing blog id'
const blogNotFoundResult = new APIErrorResult([{ message: blogIdErrorMessage, field: 'blogId' }])

@injectable()
export default class PostRouter {
    public readonly router: Router

    constructor(
        @inject(Types.PostService) private readonly posts: PostService,
        @inject(Types.BlogService) private readonly blogs: BlogService,
        @inject(Types.CommentService) private readonly comments: CommentService,
        @inject(Types.BlogPostQueryRepository) private readonly queryRepo: IBlogPostQueryRepository,
        @inject(Types.CommentQueryRepository) private readonly commentQueryRepo: ICommentQueryRepository,
        @inject(Types.AuthMiddlewareProvider) private readonly authProvider: AuthMiddlewareProvider) {
        this.router = Router()
        this.setRoutes()
        this.setCommentRoutes()
    }

    private setRoutes() {
        this.router.get('/',
            this.authProvider.optionalBearerAuthMiddleware,
            async (req: Request, res: Response) => {
                const query = new GetPostsQueryParams(req.query, req.headers.userId as string | undefined)
                const result = await this.queryRepo.getPosts(query)
                res.status(200).send(result)
            })

        this.router.get('/:id',
            this.authProvider.optionalBearerAuthMiddleware,
            async (req: Request, res: Response) => {
                const post = await this.queryRepo.getPost(req.params.id, req.headers.userId as string | undefined)

                if (!post) { res.sendStatus(404); return }
                res.status(200).send(post)
            })

        this.router.post('/',
            this.authProvider.basicAuthMiddleware,
            postValidation, this.blogIdValidation,
            validationMiddleware,
            async (req: Request, res: Response) => {
                const blog = await this.blogs.get(req.body.blogId)
                if (!blog) {
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
                if (!created) { res.sendStatus(404); return }
                const retrieved = await this.queryRepo.getPost(created.id, undefined)
                if (!retrieved) { res.sendStatus(400); return }
                res.status(201).send(retrieved)
            })

        this.router.put('/:id',
            this.authProvider.basicAuthMiddleware,
            postValidation, this.blogIdValidation,
            validationMiddleware,
            async (req: Request, res: Response) => {
                const post = await this.posts.get(req.params.id)
                if (!post) return res.sendStatus(404)

                const blog = await this.blogs.get(req.body.blogId)
                if (!blog) return res.status(400).send(blogNotFoundResult)

                const updated = await this.posts.update(req.params.id, {
                    title: req.body.title,
                    shortDescription: req.body.shortDescription,
                    content: req.body.content,
                    blogId: req.body.blogId,
                    blogName: blog.name
                })
                res.sendStatus(updated ? 204 : 500)
            })

        this.router.delete('/:id',
            this.authProvider.basicAuthMiddleware,
            async (req: Request, res: Response) => {
                const deleted = await this.posts.delete(req.params.id)
                res.sendStatus(deleted ? 204 : 404)
            })

        this.router.put('/:id/like-status',
            this.authProvider.bearerAuthMiddleware,
            likeStatusValidation,
            validationMiddleware,
            async (req: Request, res: Response) => {
                if (!await this.posts.get(req.params.id)) {
                    res.sendStatus(404); return
                }
                const result = await this.posts.putLikeInfo({
                    userId: req.headers.userId as string,
                    entityId: req.params.id,
                    status: req.body.likeStatus
                })
                res.sendStatus(result ? 204 : 400)
            })
    }

    private setCommentRoutes() {
        this.router.get('/:postId/comments',
            this.authProvider.optionalBearerAuthMiddleware,
            async (req: Request, res: Response) => {
                const query = new GetCommentsQueryParams(req.query, req.params.postId, req.headers.userId as string | undefined)
                const post = await this.posts.get(query.postId)
                if (!post) {
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
            async (req: Request, res: Response) => {
                const post = await this.posts.get(req.params.postId)
                if (!post) {
                    res.sendStatus(404)
                    return
                }

                const data: CommentCreateModel = {
                    postId: post.id,
                    userId: req.headers.userId as string,
                    userLogin: req.headers.userLogin as string,
                    content: req.body.content
                }

                const created = await this.comments.create(data)
                if (created) {
                    const retrieved = await this.commentQueryRepo.getWithoutLikes(created)
                    if (retrieved) {
                        res.status(201).send(retrieved)
                        return
                    }
                    res.sendStatus(500)
                }
            })
    }

    private blogIdValidator: CustomValidator = value => {
        return this.blogs.get(value).then((result) => {
            if (!result) return Promise.reject(blogIdErrorMessage)
        })
    }
    private blogIdValidation = body('blogId').custom(this.blogIdValidator)
}