import { Router, Request, Response } from "express"
import { CommentQueryRepository } from "../interfaces/commentQueryRepository"
import CommentService from "../../logicLayer/services/commentService"
import AuthMiddlewareProvider from "../middlewares/authMiddlewareProvider"
import { validationMiddleware } from "../middlewares/validationMiddleware"
import { commentValidation, likeStatusValidation } from "../validation/bodyValidators"
import { LikeStatus } from "../../logicLayer/models/likeModel"

export default class CommentRouter {
    public readonly router: Router
    private readonly service: CommentService
    private readonly queryRepo: CommentQueryRepository
    private authProvider: AuthMiddlewareProvider

    constructor(service:CommentService,queryRepo:CommentQueryRepository,authProvider:AuthMiddlewareProvider) {
        this.router = Router()
        this.service = service
        this.queryRepo = queryRepo
        this.authProvider = authProvider
        this.setRoutes()
    }
    private setRoutes() {
        this.router.get('/:id', 
        this.authProvider.optionalBearerAuthMiddleware,
        async (req:Request,res:Response) => {
            const result = await this.queryRepo.getById(req.params.id,req.headers.userId as string|undefined)
            if(!result) {
                res.sendStatus(404)
                return
            }
            res.status(200).send(result)
        })

        this.router.put('/:id',
        this.authProvider.bearerAuthMiddleware,
        commentValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            const comment = await this.queryRepo.getWithoutLikes(req.params.id)
            if(!comment) {
                res.sendStatus(404)
                return
            }
            if(comment.userId !== req.headers.userId) {
                res.sendStatus(403)
                return
            }
            const updated = await this.service.update(req.params.id, req.body.content)
            res.sendStatus(updated? 204 : 500)
        })

        this.router.delete('/:id',
        this.authProvider.bearerAuthMiddleware,
        async (req:Request,res:Response) => {
            const comment = await this.queryRepo.getWithoutLikes(req.params.id)
            if(!comment) {
                res.sendStatus(404)
                return
            }
            if(comment.userId !== req.headers.userId) {
                res.sendStatus(403)
                return
            }
            const deleted = await this.service.delete(req.params.id)
            res.sendStatus(deleted? 204 : 500)
        })

        this.router.put('/:id/like-status',
        this.authProvider.bearerAuthMiddleware,
        likeStatusValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            const comment = await this.queryRepo.getWithoutLikes(req.params.id)
            if(!comment) {
                res.sendStatus(404)
                return
            }
            const result = await this.service.putLikeInfo({
                userId:req.headers.userId as string,
                entityId:req.params.id,
                status:req.body.likeStatus as LikeStatus
            })
            res.sendStatus(result ? 204 : 400)
        })
    }
}