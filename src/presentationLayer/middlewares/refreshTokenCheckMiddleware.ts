import { NextFunction, Request, Response } from "express"

export const refreshTokenCheckMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const refreshToken = req.cookies['refreshToken']
    if(!refreshToken || typeof refreshToken !== 'string') {
        res.send(401)
        return
    }
    next()
}