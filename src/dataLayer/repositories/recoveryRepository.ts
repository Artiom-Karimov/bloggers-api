import "reflect-metadata";
import { IRecoveryRepository } from "../../logicLayer/interfaces/recoveryRepository";
import { PasswordRecovery } from "../models/passwordRecoveryModel";
import PasswordRecoveryMapper from "../mappers/passwordRecoveryMapper";
import PasswordRecoveryModel from "../../logicLayer/models/passwordRecoveryModel";
import { injectable } from "inversify";

@injectable()
export default class RecoveryRepository implements IRecoveryRepository {
    public async create(data:PasswordRecoveryModel): Promise<string|undefined> {
        try {
            const newModel = new PasswordRecovery(PasswordRecoveryMapper.fromBusiness(data))
            const result = await newModel.save()
            return result? result._id : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async get(code:string): Promise<PasswordRecoveryModel|undefined> {
        try {
            const result = await PasswordRecovery.findOne({_id:code})
            return result? PasswordRecoveryMapper.toBusiness(result) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async getByUser(id:string): Promise<PasswordRecoveryModel[]> {
        try {
            const result = await PasswordRecovery.find({userId:id})
            return result.map(r => PasswordRecoveryMapper.toBusiness(r))
        } catch (error) {
            console.log(error)
            return []
        }
    }
    public async delete(code:string): Promise<boolean> {
        try {
            const result = await PasswordRecovery.deleteOne({_id:code})
            return result.deletedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async deleteByUser(id:string): Promise<Boolean> {
        try {
            const result = await PasswordRecovery.deleteMany({userId:id})
            return result.acknowledged
        } catch (error) {
            console.log(error)
            return false
        }
    }
}