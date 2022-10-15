import DeviceSessionModel from "../../../logic/models/deviceSessionModel"
import DeviceSessionViewModel from "../viewModels/deviceSessionViewModel"

export default class MongoDeviceSessionModel {
    public _id: string
    public userId: string
    public ip: string
    public deviceName: string
    public issuedAt: number

    constructor(model:DeviceSessionModel) {
        this._id = model.deviceId
        this.userId = model.userId
        this.ip = model.ip
        this.deviceName = model.deviceName
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
        )
    }
    public static getViewModel(mongoModel:MongoDeviceSessionModel)
    :DeviceSessionViewModel {
        return new DeviceSessionViewModel(
            mongoModel.ip,
            mongoModel.deviceName,
            new Date(mongoModel.issuedAt).toISOString(),
            mongoModel._id
        )
    }
}