import LoginAttemptModel from "../../../logic/models/loginAttemptModel"

export default class MongoLoginAttemptModel {
    public _id:string
    public ip:string
    public login:string
    public deviceName:string
    public success:boolean
    public timestamp:number

    constructor(model:LoginAttemptModel) {
        this._id = model.id
        this.ip = model.id
        this.login = model.login
        this.deviceName = model.deviceName
        this.success = model.success
        this.timestamp = model.timestamp
    }
    public static getBusinessModel(mongoModel:MongoLoginAttemptModel)
    : LoginAttemptModel {
        return new LoginAttemptModel(
            mongoModel._id,
            mongoModel.ip,
            mongoModel.login,
            mongoModel.deviceName,
            mongoModel.success,
            mongoModel.timestamp
        )
    }
} 