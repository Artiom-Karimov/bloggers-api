import ClentActionModel, { ClientAction } from "../../../logic/models/clientActionModel"

export default class MongoClentActionModel {
    public _id:string
    public ip:string
    public action:string
    public login:string
    public deviceName:string
    public success:boolean
    public timestamp:number

    constructor(model:ClentActionModel) {
        this._id = model.id
        this.ip = model.ip
        this.action = model.action
        this.login = model.login
        this.deviceName = model.deviceName
        this.success = model.success
        this.timestamp = model.timestamp
    }
    public static getBusinessModel(mongoModel:MongoClentActionModel)
    : ClentActionModel {
        return new ClentActionModel(
            mongoModel._id,
            mongoModel.ip,
            mongoModel.action as ClientAction || ClientAction.Unset,
            mongoModel.login,
            mongoModel.deviceName,
            mongoModel.success,
            mongoModel.timestamp
        )
    }
} 