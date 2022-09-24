import { body } from "express-validator";

const httpsRegex = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/
const nameErrorMessage = 'name should be a string of 1-15 chars'
const youtubeUrlErrorMessage = 'youtubeUrl should be a valid url of 100 chars max'

export const nameValidation = body('name')
    .isString().withMessage(nameErrorMessage)
    .trim().withMessage(nameErrorMessage)
    .isLength({min:1,max:15}).withMessage(nameErrorMessage)
    
export const youtubeUrlValidation = body('youtubeUrl')
    .isString().withMessage(youtubeUrlErrorMessage)
    .trim().withMessage(youtubeUrlErrorMessage)
    .matches(httpsRegex).withMessage(youtubeUrlErrorMessage)
    .isLength({max:100}).withMessage(youtubeUrlErrorMessage)