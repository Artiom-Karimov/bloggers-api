import { Request, Response, NextFunction } from "express";
import * as config from '../../config/config'
import UserService from "../../logic/services/userService";
import JwtTokenOperator from "../../logic/utils/jwtTokenOperator";

export default class AuthMiddlewareProvider {
    private readonly basicValue: string
    
    constructor(private userService:UserService) {
        this.basicValue  = 'Basic ' + Buffer.from(`${config.userName}:${config.password}`,'utf-8').toString('base64')
    }

    public basicAuthMiddleware = async (req:Request,res:Response,next:NextFunction) => {
        if(!req.headers.authorization) {
            res.send(401)
            return
        }
        if(req.headers.authorization === this.basicValue) {
            next()
            return      
        }
        res.send(401)
    }
    public bearerAuthMiddleware = async (req:Request,res:Response,next:NextFunction) => {
        if(!req.headers.authorization) {
            res.send(401)
            return
        }
        const authHeader = req.headers.authorization.split(' ')
    
        if(authHeader[0] === 'Bearer') { 
            try {
                const authorizedId = JwtTokenOperator.unpackToken(authHeader[1])
                if(authorizedId) {
                    req.headers.userId = authorizedId
                    req.headers.userLogin = await this.userService.getLoginById(authorizedId)
                    next()
                    return
                }  
            } catch {}
        }
        res.send(401)
    }
}