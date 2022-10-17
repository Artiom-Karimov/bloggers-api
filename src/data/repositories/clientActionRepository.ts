import { Collection } from "mongodb";
import ClientActionModel from "../../logic/models/clientActionModel";
import BloggersMongoDb from "../bloggersMongoDb";
import MongoClientActionModel from "../models/mongoModels/MongoClientActionModel";

export default class ClientActionRepository {
    private readonly actions: Collection<MongoClientActionModel>

    constructor(db:BloggersMongoDb) {
        this.actions = db.clientActionCollection
    }
    public async getByIp(ip:string, fromTime:number)
    : Promise<Array<ClientActionModel>> {
        const filter = { ip:ip, timestamp: { $gte : fromTime } } 
        try {
            const result = await this.actions.find(filter).toArray()
            return result.map(a => MongoClientActionModel.getBusinessModel(a))
        } catch {
            return []
        }
    }
    public async countByIp(ip:string, fromTime:number): Promise<number> {
        const filter = { ip:ip, timestamp: { $gte : fromTime } } 
        return this.actions.countDocuments(filter)
    }
    public async create(data:ClientActionModel): Promise<boolean> {
        try {
            const result = await this.actions.insertOne(new MongoClientActionModel(data))
            return !!result.insertedId
        } catch {
            return false
        }
    }
    public async deleteAllBeforeTime(time:number): Promise<number> {
        try {
            const result = await this.actions.deleteMany({timestamp : { $lt : time }})
            return result.deletedCount
        } catch {
            return 0
        }
    }
}