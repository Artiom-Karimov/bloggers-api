import { Router, Request, Response } from 'express'
import UserQueryRepository from '../../data/repositories/userQueryRepository'
import UserService from '../../logic/userService'
import { basicAuthMiddleware, bearerAuthMiddleware } from '../middlewares/authMiddleware'
import { validationMiddleware } from '../middlewares/validationMiddleware'
import GetUsersQueryParams from '../models/getUsersQueryParams'
import { userValidation } from '../validation/bodyValidators'

export default class UserRouter {
    public readonly router: Router
    private users: UserService
    private queryRepo: UserQueryRepository

    constructor() {
        this.router = Router()
        this.users = new UserService()
        this.queryRepo = new UserQueryRepository()
        this.setRoutes()
    }

    private setRoutes() {
        this.router.get('/',
        async (req:Request, res:Response) => {
            const query = new GetUsersQueryParams(req.query)
            const result = await this.queryRepo.get(
                query.searchLoginTerm,
                query.searchEmailTerm,
                query.pageNumber,
                query.pageSize,
                query.sortBy,
                query.sortDirection
            )
            res.status(200).send(result)
        })

        this.router.post('/', 
            basicAuthMiddleware,
            userValidation,
            validationMiddleware,
        async (req:Request, res:Response) => {
            
            const created = await this.users.create({
                login: req.body.login,
                email: req.body.email,
                password: req.body.password
            })
            if(created) {
                const retrieved = await this.queryRepo.getById(created)
                res.status(201).send(retrieved)
                return
            }
            res.send(500)
        })

        this.router.delete('/:id',
            basicAuthMiddleware,
        async (req:Request, res:Response) => {
            const deleted = await this.users.delete(req.params.id)
            if(deleted) {
                res.send(204)
                return
            }
            res.send(404)
        })
    }
}