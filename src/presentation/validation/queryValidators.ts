import { query } from "express-validator";

const userLoginValidation =  query('user')
    .isString()
    .isLength({min:3,max:10})
    .withMessage('query should contain user login')

const confirmCodeValidation = query('code')
    .isString()
    .isLength({min:10,max:64})
    .withMessage('query should contain valid code')

export const confirmQueryValidation = [ userLoginValidation, confirmCodeValidation ]
