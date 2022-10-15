import { Collection } from "mongodb";
import LoginAttemptModel from "../../logic/models/loginAttemptModel";
import BloggersMongoDb from "../bloggersMongoDb";
import MongoLoginAttemptModel from "../models/mongoModels/mongoLoginAttemptModel";

export default class LoginAttemptRepository {
    private readonly attempts: Collection<MongoLoginAttemptModel>

    constructor(db:BloggersMongoDb) {
        this.attempts = db.loginAttemptCollection
    }
    public async getByIp(ip:string, fromTime:number)
    : Promise<Array<LoginAttemptModel>> {
        const filter = { ip:ip, timestamp: { $gte : fromTime } } 
        try {
            const result = await this.attempts.find(filter).toArray()
            return result.map(a => MongoLoginAttemptModel.getBusinessModel(a))
        } catch {
            return []
        }
    }
    public async countByIp(ip:string, fromTime:number): Promise<number> {
        const filter = { ip:ip, timestamp: { $gte : fromTime } } 
        return this.attempts.countDocuments(filter)
    }
    public async create(data:LoginAttemptModel): Promise<boolean> {
        try {
            const result = await this.attempts.insertOne(new MongoLoginAttemptModel(data))
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