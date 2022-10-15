import DeviceSessionRepository from "../../data/repositories/deviceSessionRepository";
import { DeviceSessionCreateType } from "../models/deviceSessionModel";
import DeviceSessionFactory from "../utils/deviceSessionFactory";
import JwtTokenOperator, { TokenPayload } from "../utils/jwtTokenOperator";

export enum DeviceSessionError {
    NoError,
    TokenError,
    WrongUserError,
    NotFoundError
}

export default class DeviceSessionService {

    constructor(private readonly repo:DeviceSessionRepository) {}

    public async createDevice(data:DeviceSessionCreateType)
    : Promise<[token:string,refreshToken:string]|undefined> {
        const device = DeviceSessionFactory.createNew(data)

        const added = await this.repo.create(device)
        if(!added) return undefined

        return JwtTokenOperator.createTokenPair({
            userId:device.userId,
            deviceId:device.deviceId,
            issuedAt:device.issuedAt
        })
    }
    public async updateDevice(oldToken:TokenPayload,data:DeviceSessionCreateType)
    : Promise<[token:string,refreshToken:string]|undefined> {
        if(!await this.checkTokenExists(oldToken)) return undefined

        const device = DeviceSessionFactory.createUpdate(oldToken.deviceId,data)

        const updated = await this.repo.update(device)
        if(!updated) return undefined

        return JwtTokenOperator.createTokenPair({
            userId:device.userId,
            deviceId:device.deviceId,
            issuedAt:device.issuedAt
        })
    }
    public async deleteDevice(refreshToken:string,deviceId:string): Promise<DeviceSessionError> {
        const payload = await this.unpackAndCheck(refreshToken)
        if(!payload) return DeviceSessionError.TokenError

        const device = await this.repo.get(deviceId)
        if(!device) return DeviceSessionError.NotFoundError
        if(device.userId !== payload.userId) return DeviceSessionError.WrongUserError

        const deleted = await this.repo.delete(deviceId)
        return deleted ? DeviceSessionError.NoError : DeviceSessionError.NotFoundError
    }
    public async deleteAllExceptOne(refreshToken:string): Promise<boolean> {
        const payload = await this.unpackAndCheck(refreshToken)
        if(!payload) return false

        const devices = await this.repo.getByUser(payload.userId)
        if(!devices) return false

        const promises = devices.filter(d => d.deviceId !== payload.deviceId)
            .map(d => this.repo.delete(d.deviceId))
        const results = await Promise.all(promises)
        return results.every(r => r)
    }
    public async checkTokenExists(data:TokenPayload): Promise<boolean> {
        const model = await this.repo.get(data.deviceId)
        if(!model) return false
        return (model.issuedAt === data.issuedAt && model.userId === data.userId)
    }
    public async unpackAndCheck(refreshToken:string): Promise<TokenPayload|undefined> {
        const payload = JwtTokenOperator.unpackRefreshToken(refreshToken)
        if(!payload) return undefined
        const exists = await this.checkTokenExists(payload)
        return exists ? payload : undefined
    }
}