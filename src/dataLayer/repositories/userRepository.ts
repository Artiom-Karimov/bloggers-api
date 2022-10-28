import "reflect-metadata";
import { injectable } from "inversify";
import { UserRepository as IUserRepository } from "../../logicLayer/interfaces/userRepository";
import UserModel, { EmailConfirmation } from "../../logicLayer/models/userModel";
import UserMapper from "../mappers/userMapper";
import { User } from "../models/userModel";

@injectable()
export default class UserRepository implements IUserRepository {
    public async get(id: string): Promise<UserModel | undefined> {
        try {
            const user = await User.findOne({_id:id})
            return user? UserMapper.toBusiness(user): undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async getByLogin(login: string): Promise<UserModel | undefined> {
        try {
            const user = await User.findOne({'accountData.login':login})
            return user? UserMapper.toBusiness(user): undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async getByEmail(email: string): Promise<UserModel | undefined> {
        try {
            const user = await User.findOne({'accountData.email':email})
            return user? UserMapper.toBusiness(user): undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async getByConfirmationCode(code: string): Promise<UserModel | undefined> {
        try {
            const user = await User.findOne({'emailConfirmation.code':code})
            return user? UserMapper.toBusiness(user): undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async create(user: UserModel): Promise<string | undefined> {
        try {
            const newUser = new User(UserMapper.fromBusiness(user))
            const result = await newUser.save()
            return result? result._id : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async updateEmailConfirmation(id: string, data: EmailConfirmation): Promise<boolean> {
        try {
            const result = await User.updateOne({_id:id},{emailConfirmation:data})
            return result.matchedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async updatePassword(id: string, hash: string, salt: string): Promise<boolean> {
        try {
            const user = await User.findOne({_id:id})
            if(!user) return false

            user.accountData.passwordHash = hash
            user.accountData.salt = salt
            const saved = await user.save()
            
            return !!saved
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async delete(id: string): Promise<boolean> {
        try {
            const result = await User.deleteOne({_id:id})
            return result.deletedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }
}