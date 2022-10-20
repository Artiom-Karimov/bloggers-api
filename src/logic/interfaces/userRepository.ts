import UserModel, { EmailConfirmation } from "../models/userModel";

export interface UserRepository {
    get(id:string): Promise<UserModel|undefined>
    getByLogin(login:string): Promise<UserModel|undefined>
    getByEmail(email:string): Promise<UserModel|undefined>
    getByConfirmationCode(code:string): Promise<UserModel|undefined>

    create(user:UserModel): Promise<string|undefined>
    updateEmailConfirmation(id:string,data:EmailConfirmation): Promise<boolean>
    delete(id:string): Promise<boolean>
}