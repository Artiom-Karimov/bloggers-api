import jwt from 'jsonwebtoken'
import { jwt as config } from '../../config/config'

export type TokenPayload = {
    userId:string,
    deviceId:string,
    issuedAt:number
}

export default class JwtTokenOperator {
    public static createTokenPair(payload:TokenPayload)
    : [token:string,refreshToken:string] {
        const token = JwtTokenOperator.createToken(payload.userId, config.jwtExpire)
        const refreshToken = JwtTokenOperator.createRefreshToken(payload, config.jwtRefreshExpire)
        return [token,refreshToken]
    }
    public static unpackToken(token:string): string|undefined {
        try {
            const result: any = jwt.verify(token,config.jwtSecret)
            return result.userId
        } catch {
            return undefined
        }
    }
    public static unpackRefreshToken(token:string): TokenPayload|undefined {
        try {
            const result: any = jwt.verify(token,config.jwtSecret)
            return { 
                userId:result.userId,
                deviceId:result.deviceId,
                issuedAt:result.issuedAt
            }
        } catch {
            return undefined
        }
    }

    private static createToken(userId:string, expiresIn:string): string {
        return jwt.sign(
            {userId:userId},
            config.jwtSecret,
            {expiresIn:expiresIn})
    }
    private static createRefreshToken(payload:TokenPayload, expiresIn:string): string {
        return jwt.sign(
            payload,
            config.jwtSecret,
            {expiresIn:expiresIn})
    }
}