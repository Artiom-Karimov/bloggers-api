import IdGenerator from "../utils/idGenerator";
import { userAuth as config } from '../../config/config'

export default class PasswordRecoveryModel {
    constructor(
        public id:string,
        public userId:string,
        public expiration:number
        ) {}

    public static create(userId:string): PasswordRecoveryModel {
        return new PasswordRecoveryModel(
            IdGenerator.generate(),
            userId,
            new Date().getTime() + config.recoveryExpiration
        )
    }
}