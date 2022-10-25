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
            res.sendStatus(401)
            return
        }
        if(req.headers.authorization === this.basicValue) {
            next()
            return      
        }
        res.sendStatus(401)
    }
    public bearerAuthMiddleware = async (req:Request,res:Response,next:NextFunction) => {
        const result = await this.validateBearerInjectUser(req)
        if(result) next()
        else res.sendStatus(401)
    }
    public optionalBearerAuthMiddleware = async (req:Request,res:Response,next:NextFunction) => {
        await this.validateBearerInjectUser(req)
        next()
    }
    private async validateBearerInjectUser(req:Request): Promise<boolean> {
        if(!req.headers.authorization) return false
        const authHeader = req.headers.authorization.split(' ')
        if(authHeader[0] !== 'Bearer') return false 

        try {
            const authorizedId = JwtTokenOperator.unpackToken(authHeader[1])
            if(authorizedId) {
                req.headers.userId = authorizedId
                req.headers.userLogin = await this.userService.getLoginById(authorizedId)
                return true
            }  
        } catch {}
        
        return false
    }
}