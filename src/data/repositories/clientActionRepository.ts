import { Collection } from "mongodb";
import ClientActionModel from "../../logic/models/clientActionModel";
import BloggersMongoDb from "../bloggersMongoDb";
import MongoClientActionModel from "../models/mongoModels/MongoClientActionModel";

export default class ClientActionRepository {
    private readonly attempts: Collection<MongoClientActionModel>

    constructor(db:BloggersMongoDb) {
        this.attempts = db.loginAttemptCollection
    }
    public async getByIp(ip:string, fromTime:number)
    : Promise<Array<ClientActionModel>> {
        const filter = { ip:ip, timestamp: { $gte : fromTime } } 
        try {
            const result = await this.attempts.find(filter).toArray()
            return result.map(a => MongoClientActionModel.getBusinessModel(a))
        } catch {
            return []
        }
    }
    public async countByIp(ip:string, fromTime:number): Promise<number> {
        const filter = { ip:ip, timestamp: { $gte : fromTime } } 
        return this.attempts.countDocuments(filter)
    }
    public async create(data:ClientActionModel): Promise<boolean> {
        try {
            const result = await this.attempts.insertOne(new MongoClientActionModel(data))
            return !!result.insertedId
        } catch {
            return false
        }
    }
    public async deleteAllBeforeTime(time:number): Promise<number> {
        try {
            const result = await this.attempts.deleteMany({timestamp : { $lt : time }})
            return result.deletedCount
        } catch {
            return 0
        }
    }
}