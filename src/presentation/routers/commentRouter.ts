import { Router, Request, Response } from "express"
import CommentQueryRepository from "../../data/repositories/commentQueryRepository"
import CommentService from "../../logic/commentService"

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
        
    }
}