import ClientActionModel, { ClientAction } from "../models/clientActionModel";

export interface ClientActionRepository {
    create(action:ClientActionModel): void
    deleteAllBeforeTime(time:number): void
    count(ip:string,action:ClientAction): number
}