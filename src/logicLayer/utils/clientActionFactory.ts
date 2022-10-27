import ClientActionModel, { ClientAction } from "../models/clientActionModel";

export default class ClientActionFactory {

    public static create(ip:string, action:ClientAction): ClientActionModel {
            return new ClientActionModel(
                ip,
                action,
                new Date().getTime()
            )
    }
}