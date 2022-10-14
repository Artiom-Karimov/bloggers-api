import DeviceSessionModel from "../../../logic/models/deviceSessionModel"
import DeviceSessionViewModel from "../viewModels/deviceSessionViewModel"

export default class MongoDeviceSessionModel {
    public _id: string
    public userId: string
    public ip: string
    public deviceName: string
    public deviceId: string
    public issuedAt: number

    constructor(model:DeviceSessionModel) {
        this._id = model.id
        this.userId = model.userId
        this.ip = model.ip
        this.deviceName = model.deviceName
        this.deviceId = model.deviceId
        this.issuedAt = model.issuedAt
    }

    public static getBusinessModel(mongoModel:MongoDeviceSessionModel)
    :DeviceSessionModel {
        return new DeviceSessionModel(
            mongoModel._id,
            mongoModel.ip,
            mongoModel.deviceName,
            mongoModel.issuedAt,
            mongoModel.userId,
            mongoModel.deviceId
        )
    }
    public static getViewModel(mongoModel:MongoDeviceSessionModel)
    :DeviceSessionViewModel {
        return new DeviceSessionViewModel(
            mongoModel.ip,
            mongoModel.deviceName,
            new Date(mongoModel.issuedAt).toISOString(),
            mongoModel.deviceId
        )
    }
}