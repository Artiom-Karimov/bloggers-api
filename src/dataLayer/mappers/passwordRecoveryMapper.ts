import PasswordRecoveryModel from "../../logicLayer/models/passwordRecoveryModel";
import { IPasswordRecovery } from "../models/passwordRecoveryModel";

export default class PasswordRecoveryMapper {
    public static fromBusiness(model:PasswordRecoveryModel): IPasswordRecovery {
        return {
            _id:model.id,
            userId:model.userId,
            expiration:model.expiration
        }
    }
    public static toBusiness(model:IPasswordRecovery): PasswordRecoveryModel {
        return new PasswordRecoveryModel(
            model._id,
            model.userId,
            model.expiration
        )
    }
}