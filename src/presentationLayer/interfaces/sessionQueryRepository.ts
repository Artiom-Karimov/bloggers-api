import DeviceSessionViewModel from "../models/viewModels/deviceSessionViewModel";

export interface ISessionQueryRepository {
    getByUser(id:string): Promise<Array<DeviceSessionViewModel>> 
}