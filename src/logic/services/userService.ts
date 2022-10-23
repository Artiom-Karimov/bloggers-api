import { UserRepository } from "../interfaces/userRepository"
import UserModel, { UserInputModel } from "../models/userModel"
import UserFactory from "../utils/userFactory"
import EmailConfirmationFactory from "../utils/emailConfirmationFactory"
import Hasher from "../utils/hasher"

export default class UserService {    

    constructor(private readonly repo: UserRepository) {}
        
    public async get(id:string): Promise<UserModel|undefined> {
        return this.repo.get(id)
    }
    public async getByLogin(login:string): Promise<UserModel|undefined> {
        return this.repo.getByLogin(login)
    }
    public async getByEmail(email:string): Promise<UserModel|undefined> {
        return this.repo.getByEmail(email)
    }
    public async getByConfirmCode(code:string): Promise<UserModel|undefined> {
        return this.repo.getByConfirmationCode(code)
    }
    public async createUnconfirmed(data:UserInputModel): Promise<string|undefined> {
        if(await this.loginExists(data.login) || await this.emailExists(data.email))
            return undefined

        const newUser = await UserFactory.create(data)
        return this.repo.create(newUser)
    }
    public async createConfirmed(data:UserInputModel): Promise<string|undefined> {
        if(await this.loginExists(data.login) || await this.emailExists(data.email))
            return undefined

        const newUser = await UserFactory.createConfirmed(data)
        return this.repo.create(newUser)
    }
    public async getLoginById(id:string): Promise<string|undefined> {
        const user = await this.get(id)
        return user? user.accountData.login : undefined
    }  
    public async delete(id:string): Promise<boolean> {
        return this.repo.delete(id)
    }
    public async loginExists(login:string): Promise<boolean> {
        const user = await this.getByLogin(login)
        return user !== undefined
    }
    public async emailExists(email:string): Promise<boolean> {
        const user = await this.getByEmail(email)
        return user !== undefined
    }
    public async renewEmailConfirmation(id:string): Promise<string|undefined> {
        const newConfirmation = EmailConfirmationFactory.getNew()
        const updated = await this.repo.updateEmailConfirmation(id,newConfirmation)
        return updated ? newConfirmation.code : undefined
    }
    public async setEmailConfirmed(id:string): Promise<boolean> {
        return this.repo.updateEmailConfirmation(id, EmailConfirmationFactory.getConfirmed())
    }
    public async setNewPassword(id:string,password:string): Promise<boolean> {
        const newPair = await Hasher.hash(password)
        return this.repo.updatePassword(id,newPair.hash,newPair.salt)
    }
}