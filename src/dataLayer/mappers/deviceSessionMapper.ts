import DeviceSessionModel from "../../logicLayer/models/deviceSessionModel";
import DeviceSessionViewModel from "../../presentationLayer/models/viewModels/deviceSessionViewModel";
import { IDeviceSession } from "../models/deviceSessionModel";

export default class DeviceSessionMapper {
    public static fromBusiness(model:DeviceSessionModel): IDeviceSession {
        return {
            _id:model.deviceId,
            ip:model.ip,
            deviceName:model.deviceName? model.deviceName : '<unknown>',
            issuedAt:model.issuedAt,
            expiresAt:model.expiresAt,
            userId:model.userId
        }
    }
    public static toBusiness(model:IDeviceSession): DeviceSessionModel {
        return new DeviceSessionModel(
            model._id,
            model.ip,
            model.deviceName,
            model.issuedAt,
            model.expiresAt,
            model.userId
        )
    }
    public static toView(model:IDeviceSession): DeviceSessionViewModel {
        return new DeviceSessionViewModel(
            model.ip,
            model.deviceName,
            new Date(model.issuedAt).toISOString(),
            model._id
        )
    }
}