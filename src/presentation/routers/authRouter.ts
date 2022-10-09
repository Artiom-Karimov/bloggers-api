import { Router, Request, Response } from "express";
import UserService from "../../logic/services/userService";
import UserQueryRepository from '../../data/repositories/userQueryRepository'
import { bearerAuthMiddleware } from "../middlewares/authMiddleware";
import { confirmCodeValidation, emailValidation, userValidation } from "../validation/bodyValidators";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { confirmQueryValidation } from "../validation/queryValidators";
import { APIErrorResult } from "../validation/apiErrorResultFormatter";

export default class AuthRouter {
    public readonly router: Router
    private repo: UserService
    private queryRepo: UserQueryRepository

    constructor() {
        this.router = Router()
        this.repo = new UserService()
        this.queryRepo = new UserQueryRepository()
        this.setRoutes()
    }
    private setRoutes() {
        this.router.post('/registration',
        userValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            if(await this.repo.loginExists(req.body.login)) {
                res.status(400).send(new APIErrorResult([ 
                    { field: 'login', message: 'login already exists' } 
                ]))
                return
            }
            if(await this.repo.emailExists(req.body.email)) {
                res.status(400).send(new APIErrorResult([ 
                    { field: 'email', message: 'email already exists' } 
                ]))
                return
            }
            const created = await this.repo.create({
                login: req.body.login,
                email: req.body.email,
                password: req.body.password
            })
            res.send(created? 204 : 400)
        })

        this.router.post('/registration-email-resending',
        emailValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            const success = await this.repo.resendConfirmationEmail(req.body.email)
            if(success) {
                res.send(204)
            }
            res.status(400).send(new APIErrorResult([ 
                { field: 'email', message: 'wrong or already confirmed email' } 
            ]))
        })

        this.router.get('/confirm-email',
        confirmQueryValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            const user = req.query.user as string
            const code = req.query.code as string
            const confirmed = await this.repo.confirmRegistration(user,code)
            res.send(confirmed ? 204 : 400)
        })

        this.router.post('/registration-confirmation',
        confirmCodeValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            const confirmed = await this.repo.confirmRegitrationByCodeOnly(req.body.code)
            if(confirmed) {
                res.send(204)
                return
            }

            res.status(400).send(new APIErrorResult([ 
                { field: 'code', message: 'wrong or already confirmed code' } 
            ]))
        })

        this.router.post('/login',
        async (req:Request,res:Response) => {
            if(!req.body.login || !req.body.password) {
                res.send(401)
                return
            }
            const token = await this.repo.authenticate(req.body.login,req.body.password)
            if(token) {                
                res.status(200).send({ accessToken: token })
                return
            }
            res.send(401)
        })
        
        this.router.get('/me', 
        bearerAuthMiddleware,
        async (req:Request,res:Response) => {
            const id = req.headers.userId as string
            const user = await this.queryRepo.getById(id || '')
            if(user) {
                res.status(200).send({
                    email: user.email,
                    login: user.login,
                    userId: user.id
                })
                return
            }
            res.send(401)
        })
    }
}