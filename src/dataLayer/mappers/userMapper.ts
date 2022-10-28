import UserModel from "../../logicLayer/models/userModel";
import UserViewModel from "../../presentationLayer/models/viewModels/userViewModel";
import { IUser } from "../models/userModel";

export default class UserMapper {
    public static fromBusiness(model:UserModel): IUser {
        return {
            _id:model.id,
            accountData:{
                login:model.accountData.login,
                email:model.accountData.email,
                passwordHash:model.accountData.passwordHash,
                salt:model.accountData.salt,
                createdAt:model.accountData.createdAt
            },
            emailConfirmation:{
                confirmed:model.emailConfirmation.confirmed,
                code:model.emailConfirmation.code,
                codeExpiration:model.emailConfirmation.codeExpiration
            }
        }
    }
    public static toBusiness(model:IUser): UserModel {
        return new UserModel(
            model._id,
            {
                login:model.accountData.login,
                email:model.accountData.email,
                passwordHash:model.accountData.passwordHash,
                salt:model.accountData.salt,
                createdAt:model.accountData.createdAt
            },
            {
                confirmed:model.emailConfirmation.confirmed,
                code:model.emailConfirmation.code,
                codeExpiration:model.emailConfirmation.codeExpiration
            }
        )
    }
    public static toView(model:IUser): UserViewModel {
        return new UserViewModel(
            model._id,
            model.accountData.login,
            model.accountData.email,
            model.accountData.createdAt
        )
    }
}