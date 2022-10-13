import { Router, Request, Response } from "express";
import UserService from "../../logic/services/userService";
import UserQueryRepository from '../../data/repositories/userQueryRepository'
import AuthMiddlewareProvider from "../middlewares/authMiddlewareProvider";
import { confirmCodeValidation, emailValidation, userValidation } from "../validation/bodyValidators";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { confirmQueryValidation } from "../validation/queryValidators";
import { APIErrorResult } from "../validation/apiErrorResultFormatter";
import { refreshTokenCheckMiddleware } from "../middlewares/refreshTokenCheckMiddleware";
import { loginCheckMiddleware } from "../middlewares/loginCheckMiddleware";
import * as config from '../../config/config'

export default class AuthRouter {
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
        this.router.post('/registration',
        userValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            if(await this.service.loginExists(req.body.login)) {
                res.status(400).send(new APIErrorResult([ 
                    { field: 'login', message: 'login already exists' } 
                ]))
                return
            }
            if(await this.service.emailExists(req.body.email)) {
                res.status(400).send(new APIErrorResult([ 
                    { field: 'email', message: 'email already exists' } 
                ]))
                return
            }
            const created = await this.service.create({
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
            const success = await this.service.resendConfirmationEmail(req.body.email)
            if(success) {
                res.send(204)
                return
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
            const confirmed = await this.service.confirmRegistration(user,code)
            res.send(confirmed ? 204 : 400)
        })

        this.router.post('/registration-confirmation',
        confirmCodeValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            const confirmed = await this.service.confirmRegitrationByCodeOnly(req.body.code)
            if(confirmed) {
                res.send(204)
                return
            }

            res.status(400).send(new APIErrorResult([ 
                { field: 'code', message: 'wrong or already confirmed code' } 
            ]))
        })

        this.router.post('/login',
        loginCheckMiddleware,
        async (req:Request,res:Response) => {          
            const tokenPair = await this.service.login(req.body.login,req.body.password)
            if(!tokenPair) {
                res.send(401)
                return
            }
            res.cookie(
                'refreshToken', 
                tokenPair[1], 
                this.getCookieSettings())            
            res.status(200).send({ accessToken: tokenPair[0] })
            return
        })

        this.router.post('/refresh-token',
        refreshTokenCheckMiddleware,
        async (req:Request,res:Response) => {
            const refreshToken = req.cookies.refreshToken
            const newPair = await this.service.renewTokenPair(refreshToken)
            if(!newPair) {
                res.send(401)
                return
            }
            res.cookie(
                'refreshToken', 
                newPair[1],
                this.getCookieSettings())            
            res.status(200).send({ accessToken: newPair[0] })
        })

        this.router.post('/logout',
        refreshTokenCheckMiddleware,
        async (req:Request,res:Response) => {
            const refreshToken = req.cookies.refreshToken
            const success = await this.service.logout(refreshToken)
            res.send(success? 204 : 401)
        })
        
        this.router.get('/me', 
        this.authProvider.bearerAuthMiddleware,
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
    private getCookieSettings(): any {
        return {
            maxAge: config.cookieMaxAge,
            secure: process.env.NODE_ENV !== "development",
            httpOnly: true
        }
    }
}