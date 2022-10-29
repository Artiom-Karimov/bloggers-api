import { Router, Request, Response } from "express";
import { ISessionQueryRepository } from "../interfaces/sessionQueryRepository";
import SessionService, { DeviceSessionError } from "../../logicLayer/services/sessionService";
import { refreshTokenCheckMiddleware } from "../middlewares/refreshTokenCheckMiddleware";
import { inject, injectable } from "inversify"
import { Types } from "../../inversifyTypes"

@injectable()
export default class SecurityRouter {
    public readonly router: Router

    constructor(
        @inject(Types.SessionService) private readonly service: SessionService ,
        @inject(Types.SessionQueryRepository) private readonly queryRepo: ISessionQueryRepository) {            
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

        this.router.delete('/devices/:deviceId',
        refreshTokenCheckMiddleware,
        async (req:Request,res:Response) => {
            const refreshToken = req.cookies.refreshToken
            const deleted = await this.service.deleteDevice(refreshToken,req.params.deviceId)
            switch(deleted) {
                case DeviceSessionError.NoError: res.sendStatus(204); break
                case DeviceSessionError.NotFoundError: res.sendStatus(404); break
                case DeviceSessionError.TokenError: res.sendStatus(401); break
                case DeviceSessionError.WrongUserError: res.sendStatus(403); break
                default: res.sendStatus(400) 
            }
        })
    }
}