import DeviceSessionModel, { DeviceSessionCreateType } from "../models/deviceSessionModel";
import IdGenerator from "./idGenerator";
import { jwt as config } from '../../config/config'

export default class DeviceSessionFactory {
    
    public static createNew(data:DeviceSessionCreateType): DeviceSessionModel {
        const deviceId = IdGenerator.generate()
        return DeviceSessionFactory.createUpdate(deviceId,data)
    }
    public static createUpdate(deviceId:string,data:DeviceSessionCreateType): DeviceSessionModel {
        const issuedAt = new Date().getTime()
        const expiresAt = issuedAt + config.refreshExpireMillis

        return new DeviceSessionModel(
            deviceId,
            data.ip,
            data.deviceName,
            issuedAt,
            expiresAt,
            data.userId,
        )
    }
}