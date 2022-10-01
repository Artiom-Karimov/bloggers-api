import { Router, Request, Response } from 'express'
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware'
import { validationMiddleware } from '../middlewares/validationMiddleware'
import GetUsersQueryParams from '../models/getUsersQueryParams'
import { userValidation } from '../validation/bodyValidators'

export default class UserRouter {
    public readonly router: Router
    private repo: any
    private queryRepo: any

    constructor() {
        this.router = Router()
        this.repo = undefined // Service here
        this.queryRepo = undefined // QueryRepo here
        this.setRoutes()
    }

    private setRoutes() {
        this.router.get('/',
            authorizationMiddleware,
        async (req:Request, res:Response) => {
            const query = new GetUsersQueryParams(req.query)
            const result = await this.queryRepo.getUsers() // Change this
            res.status(200).send(result)
        })

        this.router.post('/', 
            authorizationMiddleware,
            userValidation,
            validationMiddleware,
        async (req:Request, res:Response) => {
            res.send(404)
        })

        this.router.delete('/:id',
            authorizationMiddleware,
        async (req:Request, res:Response) => {
            res.send(404)
        })
    }
}