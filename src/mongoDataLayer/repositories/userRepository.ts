import { Collection } from "mongodb";
import { UserRepository as IUserRepository } from "../../logic/interfaces/userRepository"
import UserModel, { EmailConfirmation } from "../../logic/models/userModel";
import BloggersMongoDb from "../bloggersMongoDb";
import MongoUserModel from "../models/mongoUserModel";

export default class UserRepository { //implements IUserRepository {
    private readonly users: Collection<MongoUserModel>

    constructor(db: BloggersMongoDb) {
        this.users = db.userCollection
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
            const user = await this.users.findOne({'accountData.login':login})
            return user? MongoUserModel.getBusinessModel(user) : undefined
        } catch {
            return undefined
        }
    }
    public async getByEmail(email:string): Promise<UserModel|undefined> {
        try {
            const user = await this.users.findOne({'accountData.email':email})
            return user? MongoUserModel.getBusinessModel(user) : undefined
        } catch {
            return undefined
        }
    }
    public async getByConfirmationCode(code:string): Promise<UserModel|undefined> {
        try {
            const user = await this.users.findOne({'emailConfirmation.code':code})
            return user? MongoUserModel.getBusinessModel(user) : undefined
        } catch {
            return undefined
        }
    }
    public async create(user:UserModel): Promise<string|undefined> {
        try {
            const model = new MongoUserModel(user)
            const created = await this.users.insertOne(model)
            return created.acknowledged ? user.id : undefined
        } catch {
            return undefined
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
    public async updateEmailConfirmation(id:string,data:EmailConfirmation): Promise<boolean> {
        try {
            const result = await this.users.updateOne(
                { _id: id },
                { $set: { emailConfirmation : data } })
            return result.modifiedCount === 1
        } catch {
            return false
        }
    }
}