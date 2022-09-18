import { ValidationError, validationResult } from "express-validator";
import { Request, Response } from 'express'

type FieldError = {
    message: string,
    field: string
}

const errorFormatter = ({ location, msg, param, value, nestedErrors }: ValidationError) => {
    return { message:msg, field:param };
};

export class APIErrorResult {
    public errorsMessages: Array<FieldError> = []
    constructor(errors:Array<FieldError>) {
        this.errorsMessages = errors
    }
    public isEmpty():boolean {
        return this.errorsMessages.length === 0
    }
}

export const formatErrors = (req:Request): APIErrorResult => {
    const result = validationResult(req).formatWith(errorFormatter)
    if(!result.isEmpty())
        return new APIErrorResult(result.array())
    else return new APIErrorResult([])
}