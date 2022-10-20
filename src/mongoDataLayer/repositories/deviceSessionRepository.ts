import { Collection } from "mongodb";
import { DeviceSessionRepository as IDeviceSessionRepository } from "../../logic/interfaces/deviceSessionRepository"
import DeviceSessionModel from "../../logic/models/deviceSessionModel";
import BloggersMongoDb from "../bloggersMongoDb";
import MongoDeviceSessionModel from "../models/mongoDeviceSessionModel";

export default class DeviceSessionRepository implements IDeviceSessionRepository {
    private readonly sessions: Collection<MongoDeviceSessionModel>

    constructor(db:BloggersMongoDb) {
        this.sessions = db.deviceSessionCollection
    }
    public async get(id:string): Promise<DeviceSessionModel|undefined> {
        try {
            const result = await this.sessions.findOne({_id:id})
            return result ? MongoDeviceSessionModel.getBusinessModel(result) : undefined
        } catch {
            return undefined
        }
    }
    public async getByUser(id:string): Promise<Array<DeviceSessionModel>> {
        const result = await this.sessions.find({userId:id}).toArray()
        if(!result) return []
        return result.map(s => MongoDeviceSessionModel.getBusinessModel(s))
    }
    public async create(data:DeviceSessionModel): Promise<string|undefined> {
        const model = new MongoDeviceSessionModel(data)
        try {
            const result = await this.sessions.insertOne(model)
            return result.insertedId
        } catch {
            return undefined
        }
    }
    public async update(data:DeviceSessionModel): Promise<boolean> {
        const model = new MongoDeviceSessionModel(data)
        try {
            const result = await this.sessions.updateOne(
                {_id:model._id},
                { $set: { ip:model.ip,issuedAt:model.issuedAt,deviceName:model.deviceName } })

            return result.modifiedCount === 1
        } catch {
            return false
        }
    }
    public async delete(id:string): Promise<boolean> {
        try {
            const result = await this.sessions.deleteOne({_id:id})
            return result.deletedCount === 1
        } catch {
            return false
        }
    }
    public async deleteByUser(id:string): Promise<boolean> {
        try {
            const result = await this.sessions.deleteMany({userId:id})
            return result.deletedCount > 0
        } catch {
            return false
        }
    }
}