import { Router, Request, Response } from "express";
import UserService from "../../logic/userService";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { authValidation } from "../validation/bodyValidators";

export default class AuthRouter {
    public readonly router: Router
    private users: UserService

    constructor() {
        this.router = Router()
        this.users = new UserService()
        this.setRoutes()
    }
    private setRoutes() {
        this.router.post('/login',
        async (req:Request,res:Response) => {
            if(!req.body.login || !req.body.password) {
                res.send(401)
                return
            }
            const token = await this.users.authenticate(req.body.login,req.body.password)
            if(token) {
                res.clearCookie('token')
                res.cookie('token', token)
                res.send(204)
                return
            }
            res.send(401)
        })
    }
}