import UserModel from "../../../logic/models/userModel"
import UserViewModel from "../viewModels/userViewModel"

export default class MongoUserModel {
    public _id: string
    public login: string
    public email: string
    public createdAt: string
    public passwordHash: string
    public salt: string

    constructor(
        _id: string,
        login: string,
        email: string,
        createdAt: string,
        passwordHash: string,
        salt: string
    ) {
        this._id = _id
        this.login = login
        this.email = email
        this.createdAt = createdAt
        this.passwordHash = passwordHash
        this.salt = salt
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