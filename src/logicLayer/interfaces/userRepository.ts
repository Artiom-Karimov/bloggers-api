import UserModel, { EmailConfirmation } from "../models/userModel";

export interface IUserRepository {
    get(id:string): Promise<UserModel|undefined>
    getByLogin(login:string): Promise<UserModel|undefined>
    getByEmail(email:string): Promise<UserModel|undefined>
    getByConfirmationCode(code:string): Promise<UserModel|undefined>

    create(user:UserModel): Promise<string|undefined>
    updateEmailConfirmation(id:string,data:EmailConfirmation): Promise<boolean>
    updatePassword(id:string,hash:string,salt:string): Promise<boolean>
    delete(id:string): Promise<boolean>
}