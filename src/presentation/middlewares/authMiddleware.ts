import { Request, Response, NextFunction } from "express";
import UserService from "../../logic/services/userService";
import * as config from '../../config/config'

const basicValue = 'Basic ' + Buffer.from(`${config.userName}:${config.password}`,'utf-8').toString('base64')
const users = new UserService()


export const basicAuthMiddleware = async (req:Request,res:Response,next:NextFunction) => {
    if(!req.headers.authorization) {
        res.send(401)
        return
    }
    if(req.headers.authorization === basicValue) {
        next()
        return      
    }
    res.send(401)
}

export const bearerAuthMiddleware = async (req:Request,res:Response,next:NextFunction) => {
    if(!req.headers.authorization) {
        res.send(401)
        return
    }
    const authHeader = req.headers.authorization.split(' ')

    if(authHeader[0] === 'Bearer') { 
        try {
            const authorizedId = await users.verifyTokenGetId(authHeader[1])
            if(authorizedId) {
                req.headers.userId = authorizedId
                req.headers.userLogin = await users.getLoginById(authorizedId)
                next()
                return
            }  
        } catch {}
    }
    res.send(401)
}