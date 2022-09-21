import { NextFunction, Request, Response } from "express"
import { formatErrors } from "./apiErrorResultFormatter"

export const validationMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const errors = formatErrors(req)
    if(errors.isEmpty()) next()
    else res.status(400).send(errors)
}