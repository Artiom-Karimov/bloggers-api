import UserRepository from "../../data/repositories/userRepository"
import UserModel, { UserInputModel } from "../models/userModel"
import Hasher from "../utils/hasher"
import jwt from 'jsonwebtoken'
import { jwt as config } from '../../config/config'
import UserFactory from "../utils/userFactory"
import ConfirmationEmailSender from "../../email/confirmationEmailSender"
import EmailConfirmationFactory from "../utils/emailConfirmationFactory"
import TokenCreator from "../utils/tokenCreator"

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
    public async login(login: string, password: string)
    : Promise<[token:string,refreshToken:string]|undefined> {
        const user = await this.getByLogin(login)
        if(!user) return undefined
        if(!await this.allowUserLogin(user,login,password))
            return undefined 

        const pair = TokenCreator.createTokenPair(user)
        const saved = await this.repo.appendRefreshToken(user.id,pair[1])

        return saved ? pair : undefined
    }
    public async renewTokenPair(refreshToken:string)
    : Promise<[token:string,refreshToken:string]|undefined> {
        const user = await this.getByRefreshToken(refreshToken)
        if(!user) return undefined

        const removed = await this.repo.removeRefreshToken(user.id,refreshToken)
        if(!removed) return undefined

        const pair = TokenCreator.createTokenPair(user)
        const saved = await this.repo.appendRefreshToken(user.id,pair[1])

        return saved ? pair : undefined
    }
    public async logout(refreshToken:string): Promise<boolean> {
        const user = await this.getByRefreshToken(refreshToken)
        if(!user) return false

        return this.repo.removeRefreshToken(user.id,refreshToken)
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
    public async verifyTokenGetId(token:string): Promise<string|undefined> {
        try {
            const result: any = jwt.verify(token,config.jwtSecret)
            return result.userId
        } catch {
            return undefined
        }
    }
    private async allowUserLogin(user:UserModel,login:string,password:string): Promise<boolean> {
        if(!user.emailConfirmation.confirmed) return false
        return Hasher.check(password,user.accountData.passwordHash,user.accountData.salt)
    }
    private async getByRefreshToken(refreshToken:string): Promise<UserModel|undefined> {
        const id = await this.verifyTokenGetId(refreshToken)
        if(!id) return undefined

        const user = await this.get(id)
        if(!user) return undefined
        if(!user.refreshTokens.includes(refreshToken)) return undefined

        return user
    }
}