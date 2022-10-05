import { body } from "express-validator";

const httpsRegex = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

const nameErrorMessage = 'name should be a string of 1-15 chars'
const youtubeUrlErrorMessage = 'youtubeUrl should be a valid url of 100 chars max'
const titleErrorMessage = 'title should be a string of 1-30 chars'
const shortDescriptionErrorMessage = 'shortDescription should be a string of 1-100 chars'
const contentErrorMessage = 'content should be a string of 1-1000 chars'
const loginErrorMessage = 'login should be a valid string of 3-10 chars'
const passwordErrorMessage = 'password should be a valid string of 6-20 chars'
const emailErrorMessage = 'email should be valid'
const commentErrorMessage = 'content should be 20-300 chars long'

const stringValidation = (param:string, minLength:number, maxLength:number, message:string) => {
    return body(param).isString().withMessage(message)
        .trim().isLength({min:minLength,max:maxLength}).withMessage(message)
} 

const nameValidation = stringValidation('name', 1, 15, nameErrorMessage)
const youtubeUrlValidation = [ 
    stringValidation('youtubeUrl', 1, 100, youtubeUrlErrorMessage),
    body('youtubeUrl').matches(httpsRegex).withMessage(youtubeUrlErrorMessage) 
]

const titleValidation = stringValidation('title', 1, 30, titleErrorMessage)
const shortDescriptionValidation = stringValidation('shortDescription', 1, 100, shortDescriptionErrorMessage)
const contentValidation = stringValidation('content', 1, 1000, contentErrorMessage)

const loginValidation = stringValidation('login', 3, 10, loginErrorMessage)
const passwordValidation = stringValidation('password', 6, 20, passwordErrorMessage)
const emailValidation = body('email').matches(emailRegex).withMessage(emailErrorMessage) 

export const blogValidation = [ nameValidation, ...youtubeUrlValidation ]
export const postValidation = [ titleValidation, shortDescriptionValidation, contentValidation]
export const userValidation = [ loginValidation, passwordValidation, emailValidation ]
export const authValidation = [ loginValidation, passwordValidation ]
export const commentValidation = stringValidation('content', 20, 300, commentErrorMessage)