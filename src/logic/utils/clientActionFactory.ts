import ClientActionModel, { ClientAction } from "../models/clientActionModel";
import { ConfirmEmailModelType, LoginModelType, RegisterModelType, ResendEmailModelType, RenewTokenModelType } from "../models/clientActionTypes";
import IdGenerator from "./idGenerator";

export default class ClientActionFactory {
    public static createLogin(data:LoginModelType,success:boolean): ClientActionModel {
        return this.create(data.ip,ClientAction.Login,data.login,data.deviceName,success)
    }
    public static createRegister(data:RegisterModelType,success:boolean): ClientActionModel {
        return this.create(data.ip,ClientAction.Register,data.login,data.deviceName,success)
    }
    public static createResend(data:ResendEmailModelType,success:boolean,login:string = ''): ClientActionModel {
        return this.create(data.ip,ClientAction.Register,login,data.deviceName,success)
    }
    public static createRenew(data:RenewTokenModelType,success:boolean,login:string = ''): ClientActionModel {
        return this.create(data.ip,ClientAction.RenewToken,login,data.deviceName,success)
    }
    public static createConfirm(data:ConfirmEmailModelType,success:boolean) {
        return this.create(data.ip,ClientAction.ConfirmEmail,data.login,data.deviceName,success)
    }
    public static create(
        ip:string,
        action:ClientAction,
        login:string,
        deviceName:string,
        success:boolean): ClientActionModel {
            return new ClientActionModel(
                IdGenerator.generate(),
                ip,
                action,
                login,
                deviceName,
                success,
                new Date().getTime()
            )
    }
}