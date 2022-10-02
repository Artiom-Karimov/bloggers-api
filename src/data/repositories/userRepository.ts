import { Collection } from "mongodb";
import * as config from '../../config/config'
import UserModel, { UserInputModel } from "../../logic/models/userModel";
import BloggersMongoDb from "../bloggersMongoDb";
import MongoUserModel from "../models/mongoModels/mongoUserModel";

export default class UserRepository {
    private readonly db: BloggersMongoDb
    private readonly users: Collection<MongoUserModel>

    constructor() {
        this.db = config.db
        this.users = this.db.userCollection
    }
    public async get(id:string): Promise<UserModel|undefined> {
        try {
            const user = await this.users.findOne({_id:id})
            return user? MongoUserModel.getBusinessModel(user) : undefined
        } catch {
            return undefined
        }
    }
    public async getByLogin(login:string): Promise<UserModel|undefined> {
        try {
            const user = await this.users.findOne({login:login})
            if(user) {
                return MongoUserModel.getBusinessModel(user)
            }
            return undefined
        } catch {
            return undefined
        }
    }
    public async create(user:UserModel): Promise<string|undefined> {
        try {
            const model = new MongoUserModel(user)
            const created = await this.users.insertOne(model)
            if(created.acknowledged) return user.id
            return undefined
        } catch {
            return undefined
        }
    }
    public async update(id:string,data:UserInputModel): Promise<boolean> {
        try {
            const result = await this.users.updateOne(
                {_id:id},
                {$set : {...data}}
            )
            return result.matchedCount === 1
        } catch {
            return false
        }
    }
    public async delete(id:string): Promise<boolean> {
        try {
            const result = await this.users.deleteOne({_id:id})
            return result.deletedCount === 1
        } catch {
            return false
        }
    }
}