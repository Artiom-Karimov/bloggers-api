import "reflect-metadata";
import { injectable } from "inversify";
import { ISessionQueryRepository } from "../../../presentationLayer/interfaces/sessionQueryRepository";
import DeviceSessionViewModel from "../../../presentationLayer/models/viewModels/deviceSessionViewModel";
import DeviceSessionMapper from "../../mappers/deviceSessionMapper";
import { DeviceSession } from "../../models/deviceSessionModel";

@injectable()
export default class SessionQueryRepository implements ISessionQueryRepository {
    public async getByUser(id: string): Promise<DeviceSessionViewModel[]> {
        try {
            const sessions = await DeviceSession.find({userId:id}).exec()
            return sessions.map(s => DeviceSessionMapper.toView(s))     
        } catch (error) {
            console.log(error)
            return []
        }
    }
}
