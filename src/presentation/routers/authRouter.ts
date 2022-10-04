import { Router, Request, Response } from "express";
import UserService from "../../logic/userService";

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
                res.status(201).send(token)
                return
            }
            res.send(401)
        })
    }
}