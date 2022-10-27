import DeviceSessionModel from "../models/deviceSessionModel";

export interface DeviceSessionRepository {
    get(id:string): Promise<DeviceSessionModel|undefined>
    getByUser(id:string): Promise<Array<DeviceSessionModel>>
    create(session:DeviceSessionModel): Promise<string|undefined>
    update(session:DeviceSessionModel): Promise<boolean>
    delete(id:string): Promise<boolean>
}