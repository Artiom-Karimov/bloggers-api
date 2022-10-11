import UserModel, { AccountData, EmailConfirmation } from "../../../logic/models/userModel"
import UserViewModel from "../viewModels/userViewModel"


export default class MongoUserModel {
    public _id: string
    public accountData: AccountData
    public emailConfirmation: EmailConfirmation 
    public refreshTokens: string[]

    constructor(user:UserModel) {
        this._id = user.id
        this.accountData = {
            login:user.accountData.login,
            email:user.accountData.email,
            passwordHash:user.accountData.passwordHash,
            salt:user.accountData.salt,
            createdAt:user.accountData.createdAt
        }
        this.emailConfirmation = {
            confirmed:user.emailConfirmation.confirmed,
            code:user.emailConfirmation.code,
            codeExpiration:user.emailConfirmation.codeExpiration
        }
        this.refreshTokens = [...user.refreshTokens ]
    }
    public static getBusinessModel(mongoModel:MongoUserModel): UserModel {
        return new UserModel(
            mongoModel._id,
            mongoModel.accountData,
            mongoModel.emailConfirmation,
            mongoModel.refreshTokens
        )
    }
    public static getViewModel(mongoModel:MongoUserModel): UserViewModel {
        return new UserViewModel(
            mongoModel._id,
            mongoModel.accountData.login,
            mongoModel.accountData.email, 
            mongoModel.accountData.createdAt
        )
    }
}