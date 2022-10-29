import SessionModel, { SessionCreateType } from "../models/sessionModel";
import IdGenerator from "./idGenerator";
import { jwt as config } from '../../config/config'

export default class DeviceSessionFactory {
    
    public static createNew(data:SessionCreateType): SessionModel {
        const deviceId = IdGenerator.generate()
        return DeviceSessionFactory.createUpdate(deviceId,data)
    }
    public static createUpdate(deviceId:string,data:SessionCreateType): SessionModel {
        const issuedAt = new Date().getTime()
        const expiresAt = issuedAt + config.refreshExpireMillis

        return new SessionModel(
            deviceId,
            data.ip,
            data.deviceName,
            issuedAt,
            expiresAt,
            data.userId,
        )
    }
}