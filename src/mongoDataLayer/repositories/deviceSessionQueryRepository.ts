import { Collection } from "mongodb";
import BloggersMongoDb from "../bloggersMongoDb";
import MongoDeviceSessionModel from "../models/mongoModels/mongoDeviceSessionModel";
import DeviceSessionViewModel from "../../presentation/models/deviceSessionViewModel";

export default class DeviceSessionQueryRepository {
    private readonly sessions: Collection<MongoDeviceSessionModel>

    constructor(db:BloggersMongoDb) {
        this.sessions = db.deviceSessionCollection
    }
    public async getByUser(id:string): Promise<Array<DeviceSessionViewModel>> {
        const result = await this.sessions.find({userId:id}).toArray()
        if(!result) return []
        return result.map(s => MongoDeviceSessionModel.getViewModel(s))
    }
}