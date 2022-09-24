import { body } from "express-validator";

const titleErrorMessage = 'title should be a string of 1-30 chars'
const shortDescriptionErrorMessage = 'shortDescription should be a string of 1-100 chars'
const contentErrorMessage = 'content should be a string of 1-1000 chars'

const stringValidation = (param:string, maxLength:number, message:string) => {
    return body(param).isString().withMessage(message)
        .trim().isLength({min:1,max:maxLength}).withMessage(message)
} 

export const titleValidation = stringValidation('title', 30, titleErrorMessage)
export const shortDescriptionValidation = stringValidation('shortDescription', 100, shortDescriptionErrorMessage)
export const contentValidation = stringValidation('content', 1000, contentErrorMessage)
 