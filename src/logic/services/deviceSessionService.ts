import DeviceSessionRepository from "../../data/repositories/deviceSessionRepository";
import DeviceSessionModel, { DeviceSessionCreateType } from "../models/deviceSessionModel";
import DeviceSessionFactory from "../utils/deviceSessionFactory";
import JwtTokenOperator, { TokenPayload } from "../utils/jwtTokenOperator";

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
    public async deleteDevice(token:TokenPayload): Promise<boolean> {
        const exists = await this.checkTokenExists(token)
        return exists ? this.repo.delete(token.deviceId) : false
    }
    public async checkTokenExists(data:TokenPayload): Promise<boolean> {
        const model = await this.repo.get(data.deviceId)
        if(!model) return false
        return (model.issuedAt === data.issuedAt && model.userId === data.userId)
    }
}