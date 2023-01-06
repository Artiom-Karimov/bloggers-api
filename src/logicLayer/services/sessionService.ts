import "reflect-metadata";
import { inject, injectable } from "inversify";
import { ISessionRepository } from "../interfaces/sessionRepository";
import { SessionCreateType } from "../models/sessionModel";
import TokenPair from "../models/tokenPair";
import SessionFactory from "../utils/sessionFactory";
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
        const device = SessionFactory.createNew(data)

        const added = await this.repo.create(device)
        if (!added) return undefined
        // Pass date from device
        return JwtTokenOperator.createTokenPair({
            userId: device.userId,
            deviceId: device.deviceId,
            issuedAt: device.issuedAt
        })
    }
    public async updateDevice(oldToken: TokenPayload, data: SessionCreateType)
        : Promise<TokenPair | undefined> {
        if (!await this.checkTokenExists(oldToken)) return undefined

        const device = SessionFactory.createUpdate(oldToken.deviceId, data)

        const updated = await this.repo.update(device)
        if (!updated) return undefined
        // Pass date from device
        return JwtTokenOperator.createTokenPair({
            userId: device.userId,
            deviceId: device.deviceId,
            issuedAt: device.issuedAt
        })
    }
    public async deleteDevice(refreshToken: string, deviceId: string): Promise<DeviceSessionError> {
        const payload = await this.unpackAndCheck(refreshToken)
        if (!payload) return DeviceSessionError.TokenError

        const device = await this.repo.get(deviceId)
        if (!device) return DeviceSessionError.NotFoundError
        if (device.userId !== payload.userId) return DeviceSessionError.WrongUserError

        const deleted = await this.repo.delete(deviceId)
        return deleted ? DeviceSessionError.NoError : DeviceSessionError.NotFoundError
    }
    public async deleteAllExceptOne(refreshToken: string): Promise<boolean> {
        const payload = await this.unpackAndCheck(refreshToken)
        if (!payload) return false

        return this.repo.deleteAllButOne(payload.userId, payload.deviceId);
    }
    public async checkTokenExists(data: TokenPayload): Promise<boolean> {
        const model = await this.repo.get(data.deviceId)
        if (!model) return false
        return (model.issuedAt === data.issuedAt && model.userId === data.userId)
    }
    public async unpackAndCheck(refreshToken: string): Promise<TokenPayload | undefined> {
        const payload = JwtTokenOperator.unpackRefreshToken(refreshToken)
        if (!payload) return undefined
        const exists = await this.checkTokenExists(payload)
        return exists ? payload : undefined
    }
}