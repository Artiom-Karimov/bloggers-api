import { Router, Request, Response } from "express"
import CommentQueryRepository from "../../data/repositories/commentQueryRepository"
import CommentService from "../../logic/commentService"
import { bearerAuthMiddleware } from "../middlewares/authMiddleware"
import { validationMiddleware } from "../middlewares/validationMiddleware"
import { commentValidation } from "../validation/bodyValidators"

export default class CommentRouter {
    public readonly router: Router
    private readonly repo: CommentService
    private readonly queryRepo: CommentQueryRepository

    constructor() {
        this.router = Router()
        this.repo = new CommentService()
        this.queryRepo = new CommentQueryRepository()
        this.setRoutes()
    }
    private setRoutes() {
        this.router.get('/:id', 
        async (req:Request,res:Response) => {
            const result = await this.queryRepo.getById(req.params.id)
            if(!result) {
                res.send(404)
                return
            }
            res.status(200).send(result)
        })

        this.router.put('/:id',
        bearerAuthMiddleware,
        commentValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            const comment = await this.queryRepo.getById(req.params.id)
            if(!comment) {
                res.send(404)
                return
            }
            if(comment.userId !== req.headers.userId) {
                res.send(403)
                return
            }
            const updated = await this.repo.update(req.params.id, req.body.content)
            res.send(updated? 204 : 500)
        })

        this.router.delete('/:id',
        bearerAuthMiddleware,
        async (req:Request,res:Response) => {
            const comment = await this.queryRepo.getById(req.params.id)
            if(!comment) {
                res.send(404)
                return
            }
            if(comment.userId !== req.headers.userId) {
                res.send(403)
                return
            }
            const deleted = await this.repo.delete(req.params.id)
            res.send(deleted? 204 : 500)
        })
    }
}