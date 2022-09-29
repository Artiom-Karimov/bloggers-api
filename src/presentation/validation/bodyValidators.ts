import { body } from "express-validator";

const httpsRegex = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/
const nameErrorMessage = 'name should be a string of 1-15 chars'
const youtubeUrlErrorMessage = 'youtubeUrl should be a valid url of 100 chars max'
const titleErrorMessage = 'title should be a string of 1-30 chars'
const shortDescriptionErrorMessage = 'shortDescription should be a string of 1-100 chars'
const contentErrorMessage = 'content should be a string of 1-1000 chars'

const stringValidation = (param:string, maxLength:number, message:string) => {
    return body(param).isString().withMessage(message)
        .trim().isLength({min:1,max:maxLength}).withMessage(message)
} 

const nameValidation = stringValidation('name', 15, nameErrorMessage)
const youtubeUrlValidation = [ 
    stringValidation('youtubeUrl', 100, youtubeUrlErrorMessage),
    body('youtubeUrl').matches(httpsRegex).withMessage(youtubeUrlErrorMessage) 
]

const titleValidation = stringValidation('title', 30, titleErrorMessage)
const shortDescriptionValidation = stringValidation('shortDescription', 100, shortDescriptionErrorMessage)
const contentValidation = stringValidation('content', 1000, contentErrorMessage)

export const blogValidation = [ nameValidation, ...youtubeUrlValidation ]
export const postValidation = [ titleValidation, shortDescriptionValidation, contentValidation]
 