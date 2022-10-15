import { Router, Request, Response } from "express";
import DeviceSessionQueryRepository from "../../data/repositories/deviceSessionQueryRepository";
import DeviceSessionService, { DeviceSessionError } from "../../logic/services/deviceSessionService";
import AuthMiddlewareProvider from "../middlewares/authMiddlewareProvider";
import { refreshTokenCheckMiddleware } from "../middlewares/refreshTokenCheckMiddleware";

export default class SecurityRouter {
    private readonly router: Router
    private readonly service: DeviceSessionService 
    private readonly queryRepo: DeviceSessionQueryRepository
    private readonly authProvider: AuthMiddlewareProvider

    constructor(
        service:DeviceSessionService,
        queryRepo:DeviceSessionQueryRepository,
        authProvider: AuthMiddlewareProvider) {
            this.service = service
            this.queryRepo = queryRepo
            this.authProvider = authProvider
            this.router = Router()
            this.setRoutes()
    }
    private setRoutes() {
        this.router.get('/devices',
        refreshTokenCheckMiddleware,
        async (req:Request,res:Response) => {
            const tokenData = await this.service.unpackAndCheck(req.cookies.refreshToken)
            if(!tokenData) {
                res.sendStatus(401) 
                return
            }
            const devices = await this.queryRepo.getByUser(tokenData.userId)
            res.status(200).send(devices)
        })

        this.router.delete('/devices',
        refreshTokenCheckMiddleware,
        async (req:Request,res:Response) => {
            const refreshToken = req.cookies.refreshToken
            const deleted = await this.service.deleteAllExceptOne(refreshToken)
            res.sendStatus(deleted? 204 : 401)
        })

        this.router.delete('devices/:deviceId',
        refreshTokenCheckMiddleware,
        async (req:Request,res:Response) => {
            const refreshToken = req.cookies.refreshToken
            const deleted = await this.service.deleteDevice(refreshToken,req.params.deviceId)
            switch(deleted) {
                case DeviceSessionError.NotFoundError: res.sendStatus(404); break
                case DeviceSessionError.TokenError: res.sendStatus(401); break
                case DeviceSessionError.WrongUserError: res.sendStatus(403); break
                default: res.sendStatus(204) 
            }
        })
    }
}