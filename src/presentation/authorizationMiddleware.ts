import { Request, Response, NextFunction } from "express";

const userName = process.env.USER_NAME || 'admin'
const password = process.env.PASSWORD || 'qwerty'

const base64 = Buffer.from(`${userName}:${password}`,'utf-8').toString('base64')
const authString = `Basic ${base64}`

const noHeaderMessage = 'You should specify authorization header (Basic)'
const wrongPasswordMessage = 'Login or password is incorrect'

export const authorizationMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const authValue = req.headers['authorization']
    if(authValue == null)
        res.status(401).send(noHeaderMessage)
    else if(authValue !== authString)
        res.status(401).send(wrongPasswordMessage)
    else next()
}