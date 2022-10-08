import UserRepository from "../../data/repositories/userRepository"
import UserModel, { UserInputModel } from "../models/userModel"
import Hasher from "../utils/hasher"
import jwt from 'jsonwebtoken'
import { jwt as config } from '../../config/config'
import UserFactory from "../utils/userFactory"
import ConfirmationEmailSender from "../../email/confirmationEmailSender"
import EmailConfirmationFactory from "../utils/emailConfirmationFactory"

export default class UserService {
    private readonly repo: UserRepository
    private readonly confirmSender: ConfirmationEmailSender

    constructor() {
        this.repo = new UserRepository()
        this.confirmSender = new ConfirmationEmailSender()
    }
    public async get(id:string): Promise<UserModel|undefined> {
        return this.repo.get(id)
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
    public async authenticate(login: string, password: string): Promise<string|undefined> {
        const user = await this.repo.getByLogin(login)
        if(!user) return undefined
        if(!user.emailConfirmation.confirmed) return undefined
        if(!await Hasher.check(password,user.accountData.passwordHash,user.accountData.salt))
            return undefined
        return jwt.sign({userId:user.id},config.jwtSecret,{expiresIn:config.jwtExpire})
    }
    public async getIdFromToken(token:string): Promise<string|undefined> {
        try {
            const result: any = jwt.verify(token,config.jwtSecret)
            return result.userId
        } catch {
            return undefined
        }
    }
    public async getLoginById(id:string): Promise<string|undefined> {
        const user = await this.get(id)
        return user? user.accountData.login : undefined
    }
    public async delete(id:string): Promise<boolean> {
        return this.repo.delete(id)
    }
}