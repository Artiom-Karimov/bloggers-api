import UserRepository from "../../data/repositories/userRepository"
import UserModel, { UserInputModel } from "../models/userModel"
import UserFactory from "../utils/userFactory"
import { ConfirmEmailSender } from "../../email/confirmationEmailSender"
import EmailConfirmationFactory from "../utils/emailConfirmationFactory"

export default class UserService {    

    constructor(
        private readonly repo: UserRepository, 
        private readonly confirmSender: ConfirmEmailSender) {}
        
    public async get(id:string): Promise<UserModel|undefined> {
        return this.repo.get(id)
    }
    public async getByLogin(login:string): Promise<UserModel|undefined> {
        return this.repo.getByLogin(login)
    }
    public async getByEmail(email:string): Promise<UserModel|undefined> {
        return this.repo.getByEmail(email)
    }
    public async create(data:UserInputModel): Promise<string|undefined> {
        const newUser = await UserFactory.create(data)
        const createdId = await this.repo.create(newUser)
        if(!createdId) return undefined
        
        const emailSent = await this.confirmSender.send(
            newUser.accountData.login,
            newUser.accountData.email,
            newUser.emailConfirmation.code)

        return emailSent ? createdId : undefined
    }
    public async createConfirmed(data:UserInputModel): Promise<string|undefined> {
        if(await this.loginExists(data.login) || await this.emailExists(data.email))
            return undefined

        const newUser = await UserFactory.createConfirmed(data)
        return this.repo.create(newUser)
    }
    public async resendConfirmationEmail(email:string): Promise<boolean> {
        const user = await this.repo.getByEmail(email)
        if(!user) return false
        if(user.emailConfirmation.confirmed) return false

        const newConfirmation = EmailConfirmationFactory.getNew()
        const updated = await this.repo.updateEmailConfirmation(user.id,newConfirmation)
        if(!updated) return false

        const emailSent = await this.confirmSender.send(
            user.accountData.login,
            user.accountData.email,
            newConfirmation.code)

        return emailSent
    }
    public async confirmRegistration(login:string,code:string): Promise<boolean> {
        const user = await this.repo.getByLogin(login)
        if(!user) return false
        if(user.emailConfirmation.codeExpiration < new Date().getDate()) return false
        if(code !== user.emailConfirmation.code) return false

        return this.repo.updateEmailConfirmation(user.id, EmailConfirmationFactory.getConfirmed())
    }
    public async confirmRegitrationByCodeOnly(code:string): Promise<boolean> {
        const user = await this.repo.getByConfirmationCode(code)
        if(!user) return false
        if(user.emailConfirmation.codeExpiration < new Date().getDate()) return false

        return this.repo.updateEmailConfirmation(user.id, EmailConfirmationFactory.getConfirmed())
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
}