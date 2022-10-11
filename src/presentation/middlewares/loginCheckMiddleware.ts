import { NextFunction, Request, Response } from "express"

export const loginCheckMiddleware = (req:Request,res:Response,next:NextFunction) => {
    if(!req.body.login || !req.body.password) {
        res.send(401)
        return
    }
    next()
}