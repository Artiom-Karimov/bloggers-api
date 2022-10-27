import DeviceSessionViewModel from "../models/viewModels/deviceSessionViewModel";

export interface DeviceSessionQueryRepository {
    getByUser(id:string): Promise<Array<DeviceSessionViewModel>> 
}