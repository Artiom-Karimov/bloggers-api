import { NextFunction, Request, Response } from "express"
import { APIErrorResult, formatErrors } from "../validation/apiErrorResultFormatter"

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
        const logpass = errors.errorsMessages.some(err => err.field === 'login' || err.field === 'password')
        const status = logpass? 401 : 400
        res.status(status).send(removeDuplicates(errors))
    }
}