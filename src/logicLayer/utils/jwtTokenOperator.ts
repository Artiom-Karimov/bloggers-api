import jwt from 'jsonwebtoken'
import { jwt as config } from '../../config/config'
import TokenPair from '../models/tokenPair'

export type TokenPayload = {
    userId: string,
    deviceId: string,
    issuedAt: number,
    exp: number,
}

export default class JwtTokenOperator {
    public static createTokenPair(payload: TokenPayload)
        : TokenPair {
        const token = JwtTokenOperator.createToken(payload.userId, config.expire)
        const refreshToken = JwtTokenOperator.createRefreshToken(payload)
        return new TokenPair(token, refreshToken)
    }
    public static unpackToken(token: string): string | undefined {
        try {
            const result: any = jwt.verify(token, config.secret)
            return result.userId
        } catch {
            return undefined
        }
    }
    public static unpackRefreshToken(token: string): TokenPayload | undefined {
        try {
            const result: any = jwt.verify(token, config.secret)
            return {
                userId: result.userId,
                deviceId: result.deviceId,
                issuedAt: result.issuedAt,
                exp: result.exp,
            }
        } catch {
            return undefined
        }
    }

    private static createToken(userId: string, expiresIn: string): string {
        return jwt.sign(
            { userId: userId },
            config.secret,
            { expiresIn: expiresIn })
    }
    private static createRefreshToken(payload: TokenPayload): string {
        const exp = Math.floor(payload.exp / 1000);
        return jwt.sign({ ...payload, exp }, config.secret);
    }
}