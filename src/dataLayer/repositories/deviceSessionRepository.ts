import "reflect-metadata";
import { injectable } from "inversify";
import { DeviceSessionRepository as IDeviceSessionRepository } from "../../logicLayer/interfaces/deviceSessionRepository";
import DeviceSessionModel from "../../logicLayer/models/deviceSessionModel";
import DeviceSessionMapper from "../mappers/deviceSessionMapper";
import { DeviceSession } from "../models/deviceSessionModel";

@injectable()
export default class DeviceSessionRepository implements IDeviceSessionRepository {
    public async get(id: string): Promise<DeviceSessionModel | undefined> {
        try {
            const session = await DeviceSession.findOne({_id:id})
            return session? DeviceSessionMapper.toBusiness(session) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async getByUser(id: string): Promise<DeviceSessionModel[]> {
        try {
            const sessions = await DeviceSession.find({userId:id})
            return sessions.map(s => DeviceSessionMapper.toBusiness(s))
        } catch (error) {
            console.log(error)
            return []
        }
    }
    public async create(session: DeviceSessionModel): Promise<string | undefined> {
        try {
            const newSession = new DeviceSession(DeviceSessionMapper.fromBusiness(session))
            const result = await newSession.save()
            return result? result._id : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async update(session: DeviceSessionModel): Promise<boolean> {
        try {
            const result = await DeviceSession.updateOne({_id:session.deviceId}, session)
            return result.matchedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async delete(id: string): Promise<boolean> {
        try {
            const result = await DeviceSession.deleteOne({_id:id})
            return result.deletedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }

}