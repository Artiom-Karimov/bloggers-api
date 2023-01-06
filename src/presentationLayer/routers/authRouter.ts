import { Router, Request, Response } from "express";
import { IUserQueryRepository } from '../interfaces/userQueryRepository'
import AuthMiddlewareProvider from "../middlewares/authMiddlewareProvider";
import { confirmCodeValidation, emailValidation, newPasswordValidation, userValidation } from "../validation/bodyValidators";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { confirmQueryValidation } from "../validation/queryValidators";
import { APIErrorResult } from "../validation/apiErrorResultFormatter";
import { refreshTokenCheckMiddleware } from "../middlewares/refreshTokenCheckMiddleware";
import { loginCheckMiddleware } from "../middlewares/loginCheckMiddleware";
import * as config from '../../config/config'
import AuthService from "../../logicLayer/services/authService";
import { AuthError } from "../../logicLayer/models/authError";
import TokenPair from "../../logicLayer/models/tokenPair";
import RecoveryService from "../../logicLayer/services/recoveryService";
import { inject, injectable } from "inversify";
import { Types } from "../../inversifyTypes";
import { ddosMiddleware } from "../middlewares/ddosMiddleware";

@injectable()
export default class AuthRouter {
    public readonly router: Router

    constructor(
        @inject(Types.AuthService) private readonly authService: AuthService,
        @inject(Types.RecoveryService) private readonly recoveryService: RecoveryService,
        @inject(Types.UserQueryRepository) private readonly queryRepo: IUserQueryRepository,
        @inject(Types.AuthMiddlewareProvider) private readonly authProvider: AuthMiddlewareProvider) {
        this.router = Router()
        this.setRoutes()
    }
    private setRoutes() {
        this.router.post('/registration',
            ddosMiddleware,
            userValidation,
            validationMiddleware,
            async (req: Request, res: Response) => {
                const result = await this.authService.register({
                    login: req.body.login,
                    email: req.body.email,
                    password: req.body.password,
                    ip: req.ip,
                    deviceName: req.headers["user-agent"] || ''
                })
                switch (result) {
                    case AuthError.NoError: res.sendStatus(204); break;
                    case AuthError.ActionLimit: res.sendStatus(429); break;
                    case AuthError.LoginExists: {
                        res.status(400).send(new APIErrorResult([
                            { field: 'login', message: 'login already exists' }]))
                        break;
                    }
                    case AuthError.EmailExists: {
                        res.status(400).send(new APIErrorResult([
                            { field: 'email', message: 'email already exists' }]))
                        break;
                    }
                    default: res.sendStatus(400)
                }
            })

        this.router.post('/registration-email-resending',
            ddosMiddleware,
            emailValidation,
            validationMiddleware,
            async (req: Request, res: Response) => {
                const result = await this.authService.resendConfirmationEmail({
                    email: req.body.email,
                    ip: req.ip,
                    deviceName: req.headers["user-agent"] || ''
                })
                switch (result) {
                    case AuthError.NoError: res.sendStatus(204); break;
                    case AuthError.ActionLimit: res.sendStatus(429); break;
                    case AuthError.WrongCredentials:
                    case AuthError.AlreadyConfirmed: {
                        res.status(400).send(new APIErrorResult([
                            { field: 'email', message: 'wrong or already confirmed email' }
                        ]))
                        break;
                    }
                    default: res.sendStatus(400)
                }
            })

        this.router.get('/confirm-email',
            ddosMiddleware,
            confirmQueryValidation,
            validationMiddleware,
            async (req: Request, res: Response) => {
                const result = await this.authService.confirmRegistration({
                    login: req.query.user as string,
                    ip: req.ip,
                    deviceName: req.headers["user-agent"] || '',
                    code: req.query.code as string
                })
                switch (result) {
                    case AuthError.NoError: res.sendStatus(204); break;
                    case AuthError.ActionLimit: res.sendStatus(429); break;
                    case AuthError.UserNotFound:
                    case AuthError.WrongCode: {
                        res.status(400).send(new APIErrorResult([
                            { field: 'code', message: 'invalid code or user' }
                        ]))
                        break;
                    }
                    default: res.sendStatus(400)
                }
            })

        this.router.post('/registration-confirmation',
            ddosMiddleware,
            confirmCodeValidation,
            validationMiddleware,
            async (req: Request, res: Response) => {
                const result = await this.authService.confirmRegitrationByCodeOnly({
                    login: '',
                    ip: req.ip,
                    deviceName: req.headers["user-agent"] || '',
                    code: req.body.code
                })
                switch (result) {
                    case AuthError.NoError: res.sendStatus(204); break;
                    case AuthError.ActionLimit: res.sendStatus(429); break;
                    case AuthError.UserNotFound:
                    case AuthError.WrongCode: {
                        res.status(400).send(new APIErrorResult([
                            { field: 'code', message: 'invalid code or user' }
                        ]))
                        break;
                    }
                    default: res.sendStatus(400)
                }
            })

        this.router.post('/login',
            ddosMiddleware,
            loginCheckMiddleware,
            async (req: Request, res: Response) => {
                const result = await this.authService.login({
                    login: req.body.login,
                    password: req.body.password,
                    ip: req.ip,
                    deviceName: req.headers["user-agent"] || ''
                })
                if (result instanceof TokenPair) {
                    res.cookie(
                        'refreshToken',
                        result.refreshToken,
                        this.getCookieSettings()
                    )
                    res.status(200).send({ accessToken: result.accessToken })
                    return
                }
                switch (result) {
                    case AuthError.ActionLimit: res.sendStatus(429); break;
                    case AuthError.WrongCredentials: res.sendStatus(401); break;
                    default: res.sendStatus(400)
                }
            })

        this.router.post('/refresh-token',
            ddosMiddleware,
            refreshTokenCheckMiddleware,
            async (req: Request, res: Response) => {
                const result = await this.authService.renewTokenPair({
                    refreshToken: req.cookies.refreshToken,
                    ip: req.ip,
                    deviceName: req.headers["user-agent"] || ''
                })
                if (result instanceof TokenPair) {
                    res.cookie(
                        'refreshToken',
                        result.refreshToken,
                        this.getCookieSettings()
                    )
                    res.status(200).send({ accessToken: result.accessToken })
                    return
                }
                res.sendStatus(401)
            })

        this.router.post('/logout',
            refreshTokenCheckMiddleware,
            async (req: Request, res: Response) => {
                const refreshToken = req.cookies.refreshToken
                const success = await this.authService.logout(refreshToken)
                res.sendStatus(success ? 204 : 401)
            })

        this.router.get('/me',
            this.authProvider.bearerAuthMiddleware,
            async (req: Request, res: Response) => {
                const id = req.headers.userId as string
                const user = await this.queryRepo.getById(id || '')
                if (user) {
                    res.status(200).send({
                        email: user.email,
                        login: user.login,
                        userId: user.id
                    })
                    return
                }
                res.send(401)
            })

        this.router.post('/password-recovery',
            ddosMiddleware,
            emailValidation,
            validationMiddleware,
            async (req: Request, res: Response) => {
                const result = await this.recoveryService.sendRecoveryEmail({
                    ip: req.ip,
                    email: req.body.email
                })
                if (result === AuthError.ActionLimit) {
                    res.sendStatus(429)
                    return
                }
                res.sendStatus(204)
            })

        this.router.post('/new-password',
            ddosMiddleware,
            newPasswordValidation,
            validationMiddleware,
            async (req: Request, res: Response) => {
                const result = await this.recoveryService.setNewPassword({
                    ip: req.ip,
                    password: req.body.newPassword,
                    code: req.body.recoveryCode
                })
                if (result === AuthError.ActionLimit) {
                    res.sendStatus(429); return
                }
                if (result === AuthError.NoError) {
                    res.sendStatus(204); return
                }
                res.sendStatus(400)
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