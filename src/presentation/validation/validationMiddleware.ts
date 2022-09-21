import { NextFunction, Request, Response } from "express"
import { APIErrorResult, formatErrors } from "./apiErrorResultFormatter"

export const removeDuplicates = (errors:APIErrorResult): APIErrorResult => {
    const result = new APIErrorResult([])
    errors.errorsMessages.forEach((e) => {
        if(!result.errorsMessages.find((el) => el.field === e.field))
            result.errorsMessages.push(e)
    })
    return result
}

export const validationMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const errors = formatErrors(req)
    if(errors.isEmpty()) next()
    else {
        res.status(400).send(removeDuplicates(errors))
    }
}