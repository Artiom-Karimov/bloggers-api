import { Request, Response, NextFunction } from "express";
import * as config from '../../config/config'

const base64 = Buffer.from(`${config.userName}:${config.password}`,'utf-8').toString('base64')
const authString = `Basic ${base64}`

const noHeaderMessage = 'You should specify authorization header (Basic)'
const wrongPasswordMessage = 'Login or password is incorrect'

export const authorizationMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const authValue = req.headers['authorization']
    if(!authValue) {
        res.status(401).send(noHeaderMessage)
        return
    }      
    if(authValue !== authString) {
        res.status(401).send(wrongPasswordMessage)
        return
    }    
    next()
}