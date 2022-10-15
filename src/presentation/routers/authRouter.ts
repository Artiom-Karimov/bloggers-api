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
import AuthService from "../../logic/services/authService";

export default class AuthRouter {
    public readonly router: Router

    constructor(
        private readonly authService:AuthService,
        private readonly userService:UserService,
        private readonly queryRepo:UserQueryRepository,
        private readonly authProvider:AuthMiddlewareProvider) {
            this.router = Router()
            this.setRoutes()
    }
    private setRoutes() {
        this.router.post('/registration',
        userValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            if(await this.userService.loginExists(req.body.login)) {
                res.status(400).send(new APIErrorResult([ 
                    { field: 'login', message: 'login already exists' } 
                ]))
                return
            }
            if(await this.userService.emailExists(req.body.email)) {
                res.status(400).send(new APIErrorResult([ 
                    { field: 'email', message: 'email already exists' } 
                ]))
                return
            }
            const created = await this.userService.create({
                login: req.body.login,
                email: req.body.email,
                password: req.body.password
            })
            res.sendStatus(created? 204 : 400)
        })

        this.router.post('/registration-email-resending',
        emailValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            const success = await this.userService.resendConfirmationEmail(req.body.email)
            if(success) {
                res.sendStatus(204)
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
            const confirmed = await this.userService.confirmRegistration(user,code)
            res.sendStatus(confirmed ? 204 : 400)
        })

        this.router.post('/registration-confirmation',
        confirmCodeValidation,
        validationMiddleware,
        async (req:Request,res:Response) => {
            const confirmed = await this.userService.confirmRegitrationByCodeOnly(req.body.code)
            if(confirmed) {
                res.sendStatus(204)
                return
            }

            res.status(400).send(new APIErrorResult([ 
                { field: 'code', message: 'wrong or already confirmed code' } 
            ]))
        })

        this.router.post('/login',
        loginCheckMiddleware,
        async (req:Request,res:Response) => {     
            if(await this.authService.loginAttemptsLimit(req.ip)) {
                res.sendStatus(429)
                return
            }     
            const result = await this.authService.login({
                login: req.body.login,
                password: req.body.password,
                ip: req.ip,
                deviceName: req.headers["user-agent"] || ''
            })
            if(!result) {
                res.sendStatus(401)
                return
            }
            res.cookie(
                'refreshToken', 
                result[1], 
                this.getCookieSettings())            
            res.status(200).send({ accessToken: result[0] })
            return
        })

        this.router.post('/refresh-token',
        refreshTokenCheckMiddleware,
        async (req:Request,res:Response) => {
            const refreshToken = req.cookies.refreshToken
            const newPair = await this.authService.renewTokenPair({
                refreshToken:refreshToken,
                ip: req.ip,
                deviceName: req.headers["user-agent"] || ''
            })
            if(!newPair) {
                res.sendStatus(401)
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
            const success = await this.authService.logout(refreshToken)
            res.sendStatus(success? 204 : 401)
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