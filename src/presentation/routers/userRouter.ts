import { Router, Request, Response } from 'express'
import UserQueryRepository from '../../mongoDataLayer/repositories/userQueryRepository'
import UserService from '../../logic/services/userService'
import AuthMiddlewareProvider from "../middlewares/authMiddlewareProvider";
import { validationMiddleware } from '../middlewares/validationMiddleware'
import GetUsersQueryParams from '../models/getUsersQueryParams'
import { userValidation } from '../validation/bodyValidators'

export default class UserRouter {
    public readonly router: Router
    private service: UserService
    private queryRepo: UserQueryRepository
    private authProvider: AuthMiddlewareProvider

    constructor(service:UserService,queryRepo:UserQueryRepository,authProvider:AuthMiddlewareProvider) {
        this.router = Router()
        this.service = service
        this.queryRepo = queryRepo
        this.authProvider = authProvider
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
            this.authProvider.basicAuthMiddleware,
            userValidation,
            validationMiddleware,
        async (req:Request, res:Response) => {
            
            const created = await this.service.createConfirmed({
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
            this.authProvider.basicAuthMiddleware,
        async (req:Request, res:Response) => {
            const deleted = await this.service.delete(req.params.id)
            if(deleted) {
                res.send(204)
                return
            }
            res.send(404)
        })
    }
}