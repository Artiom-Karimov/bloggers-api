import { Router, Request, Response } from "express"
import CommentQueryRepository from "../../mongoDataLayer/repositories/commentQueryRepository"
import CommentService from "../../logic/services/commentService"
import AuthMiddlewareProvider from "../middlewares/authMiddlewareProvider"
import { validationMiddleware } from "../middlewares/validationMiddleware"
import { commentValidation } from "../validation/bodyValidators"

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
        async (req:Request,res:Response) => {
            const result = await this.queryRepo.getById(req.params.id)
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
            const comment = await this.queryRepo.getById(req.params.id)
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
            const comment = await this.queryRepo.getById(req.params.id)
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
    }
}