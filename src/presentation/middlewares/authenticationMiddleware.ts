import { Request, Response, NextFunction } from "express";
import UserService from "../../logic/userService";

const users = new UserService()

export const authenticationMiddleware = async (req:Request,res:Response,next:NextFunction) => {
    try {
        const token = req.cookies.token
        const authorizedId = await users.getIdFromToken(token)
        if(!authorizedId) {
            res.send(401)
            return
        }
        next()
    } catch {
        res.send(401)
    }
    
}