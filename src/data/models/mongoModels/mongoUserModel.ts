import UserModel from "../../../logic/models/userModel"
import UserViewModel from "../viewModels/userViewModel"

export default class MongoUserModel {
    public _id: string
    public login: string
    public email: string
    public createdAt: string
    public passwordHash: string
    public salt: string

    constructor(user:UserModel) {
        this._id = user.id
        this.login = user.login
        this.email = user.email
        this.createdAt = user.createdAt
        this.passwordHash = user.passwordHash
        this.salt = user.salt
    }
    public static getBusinessModel(mongoModel:MongoUserModel): UserModel {
        return new UserModel(
            mongoModel._id,
            mongoModel.login,
            mongoModel.email, 
            mongoModel.createdAt,
            mongoModel.passwordHash,
            mongoModel.salt
        )
    }
    public static getViewModel(mongoModel:MongoUserModel): UserViewModel {
        return new UserViewModel(
            mongoModel._id,
            mongoModel.login,
            mongoModel.email, 
            mongoModel.createdAt
        )
    }
}