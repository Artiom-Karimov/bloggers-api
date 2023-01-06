import "reflect-metadata";
import { inject, injectable } from "inversify";
import { ISessionRepository } from "../interfaces/sessionRepository";
import SessionModel, { SessionCreateType } from "../models/sessionModel";
import TokenPair from "../models/tokenPair";
import JwtTokenOperator, { TokenPayload } from "../utils/jwtTokenOperator";
import { Types } from "../../inversifyTypes";

export enum DeviceSessionError {
    NoError,
    TokenError,
    WrongUserError,
    NotFoundError
}

@injectable()
export default class SessionService {

    constructor(@inject(Types.SessionRepository) private readonly repo: ISessionRepository) { }

    public async createDevice(data: SessionCreateType)
        : Promise<TokenPair | undefined> {
        const session = SessionModel.create(data)

        const added = await this.repo.create(session)
        if (!added) return undefined

        return session.getTokenPair()
    }
    public async updateDevice(oldToken: TokenPayload, data: SessionCreateType)
        : Promise<TokenPair | undefined> {
        const session = await this.repo.get(oldToken.deviceId)
        if (!session || !session.tokenMatches(oldToken)) return undefined
        session.update(data)

        const updated = await this.repo.update(session)
        if (!updated) return undefined

        return session.getTokenPair()
    }
    public async deleteDevice(refreshToken: string, deviceId: string): Promise<DeviceSessionError> {
        const payload = await this.unpackAndCheck(refreshToken)
        if (!payload) return DeviceSessionError.TokenError

        const session = await this.repo.get(deviceId)
        if (!session) return DeviceSessionError.NotFoundError
        if (session.userId !== payload.userId) return DeviceSessionError.WrongUserError

        const deleted = await this.repo.delete(deviceId)
        return deleted ? DeviceSessionError.NoError : DeviceSessionError.NotFoundError
    }
    public async deleteAllExceptOne(refreshToken: string): Promise<boolean> {
        const payload = await this.unpackAndCheck(refreshToken)
        if (!payload) return false

        return this.repo.deleteAllButOne(payload.userId, payload.deviceId);
    }
    public async checkTokenExists(data: TokenPayload): Promise<boolean> {
        const session = await this.repo.get(data.deviceId)
        if (!session) return false
        return session.tokenMatches(data);
    }
    public async unpackAndCheck(refreshToken: string): Promise<TokenPayload | undefined> {
        const payload = JwtTokenOperator.unpackRefreshToken(refreshToken)
        if (!payload) return undefined
        const exists = await this.checkTokenExists(payload)
        return exists ? payload : undefined
    }
}