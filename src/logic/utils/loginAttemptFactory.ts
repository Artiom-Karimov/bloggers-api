import LoginAttemptModel from "../models/loginAttemptModel";
import { LoginModelType } from "../models/loginModel";
import IdGenerator from "./idGenerator";

export default class LoginAttemptFactory {
    public static create(data:LoginModelType,success:boolean): LoginAttemptModel {
        return new LoginAttemptModel(
            IdGenerator.generate(),
            data.ip,
            data.login,
            data.deviceName,
            success,
            new Date().getTime()
        )
    }
}