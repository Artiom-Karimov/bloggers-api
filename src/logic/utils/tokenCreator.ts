import jwt from 'jsonwebtoken'
import UserModel from "../models/userModel"
import { jwt as config } from '../../config/config'

export default class TokenCreator {
    public static createTokenPair(user:UserModel)
    : [token:string,refreshToken:string] {
        const token = TokenCreator.createToken(user, config.jwtExpire)
        const refreshToken = TokenCreator.createToken(user, config.jwtRefreshExpire)
        return [token,refreshToken]
    }
    public static createToken(user:UserModel, expiresIn:string) {
        return jwt.sign(
            {userId:user.id},
            config.jwtSecret,
            {expiresIn:expiresIn})
    }
}