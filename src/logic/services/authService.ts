import DeviceSessionService, { DeviceSessionError } from "./deviceSessionService";
import UserService from "./userService";
import Hasher from "../utils/hasher"
import { LoginModelType, RegisterModelType, ResendEmailModelType, RenewTokenModelType, ConfirmEmailModelType } from "../models/clientActionTypes"
import JwtTokenOperator from "../utils/jwtTokenOperator"
import UserModel from "../models/userModel";
import { ConfirmEmailSender } from "../../email/confirmationEmailSender";
import { AuthError } from "../models/authError";
import TokenPair from "../models/tokenPair";
import ClientActionService from "./clientActionService";
import { ClientAction } from "../models/clientActionModel";

export default class AuthService {
    
    constructor(
        private readonly userService: UserService,
        private readonly sessionService: DeviceSessionService,
        private readonly actionService: ClientActionService,
        private readonly confirmSender: ConfirmEmailSender
    ) {}
    public async register(data:RegisterModelType): Promise<AuthError> {
        if(this.actionService.updateAndCheckLimit(data.ip,ClientAction.Register)) return AuthError.ActionLimit

        const existsError = await this.loginOrEmailExists(data)
        if(existsError !== AuthError.NoError) return existsError

        const user = await this.createAndGetUser(data)
        if(!user) return AuthError.Unknown

        this.sendConfirmEmail(user)

        return AuthError.NoError
    }
    public async resendConfirmationEmail(data:ResendEmailModelType): Promise<AuthError> {
        if(this.actionService.updateAndCheckLimit(data.ip,ClientAction.ResendEmail)) return AuthError.ActionLimit        
            
        const user = await this.userService.getByEmail(data.email)
        if(!user) return AuthError.WrongCredentials
            
        if(user.emailConfirmation.confirmed) return AuthError.AlreadyConfirmed

        const newCode = await this.userService.renewEmailConfirmation(user.id)
        if(!newCode) return AuthError.Unknown
            
        this.sendConfirmEmail(user,newCode)

        return AuthError.NoError
    }
    public async confirmRegistration(data:ConfirmEmailModelType): Promise<AuthError> {
        if(this.actionService.updateAndCheckLimit(data.ip,ClientAction.ConfirmEmail)) return AuthError.ActionLimit
        
        const user = await this.userService.getByLogin(data.login)
        if(!user) return AuthError.UserNotFound
        
        if(user.emailConfirmation.codeExpiration < new Date().getDate() || 
            data.code !== user.emailConfirmation.code) {
                return AuthError.WrongCode
        }
        if(await this.userService.setEmailConfirmed(user.id)) return AuthError.NoError
        
        return AuthError.Unknown
    }
    public async confirmRegitrationByCodeOnly(data:ConfirmEmailModelType): Promise<AuthError> {
        if(this.actionService.updateAndCheckLimit(data.ip,ClientAction.ConfirmEmail)) return AuthError.ActionLimit

        const user = await this.userService.getByConfirmCode(data.code)
        if(!user || 
            user.emailConfirmation.codeExpiration < new Date().getDate() || 
            data.code !== user.emailConfirmation.code) {                
                return AuthError.WrongCode
        }
        if(await this.userService.setEmailConfirmed(user.id)) return AuthError.NoError
        
        return AuthError.Unknown
    }
    public async login(data:LoginModelType)
    : Promise<TokenPair|AuthError> {
        if(this.actionService.updateAndCheckLimit(data.ip,ClientAction.Login)) return AuthError.ActionLimit

        const user = await this.userService.getByLogin(data.login)
        if(!user || !await this.checkPassword(user,data.password)) return AuthError.WrongCredentials
           
        const pair = await this.sessionService.createDevice({
            ip:data.ip, deviceName:data.deviceName, userId:user.id})
        if(!pair) return AuthError.Unknown
        
        return pair
    }
    public async renewTokenPair(data:RenewTokenModelType)
    : Promise<TokenPair|AuthError> {
        if(this.actionService.updateAndCheckLimit(data.ip,ClientAction.RenewToken)) return AuthError.ActionLimit

        const tokenData = JwtTokenOperator.unpackRefreshToken(data.refreshToken)
        if(!tokenData) return AuthError.WrongToken
        
        const user = await this.userService.get(tokenData.userId)
        if(!user) return AuthError.UserNotFound

        const pair = await this.sessionService.updateDevice(
            tokenData, 
            { ip:data.ip, deviceName:data.deviceName, userId:user.id })
        if(!pair) return AuthError.WrongToken
        
        return pair
    }
    public async logout(refreshToken:string): Promise<boolean> {
        const tokenData = JwtTokenOperator.unpackRefreshToken(refreshToken)
        if(!tokenData) return false
        const user = await this.userService.get(tokenData.userId)
        if(!user) return false
      
        const deleted = await this.sessionService.deleteDevice(refreshToken,tokenData.deviceId)
        return deleted === DeviceSessionError.NoError
    } 
    private async checkPassword(user:UserModel,password:string): Promise<boolean> {
        if(!user.emailConfirmation.confirmed) return false
        return Hasher.check(password,user.accountData.passwordHash,user.accountData.salt)
    }
    private async createAndGetUser(data:RegisterModelType): Promise<UserModel|undefined> {
        const createdId = await this.userService.createUnconfirmed({
            login:data.login, email:data.email, password:data.password })
        if(!createdId) return undefined
        return this.userService.get(createdId)
    }
    private async loginOrEmailExists(data:RegisterModelType): Promise<AuthError> {
        const loginExists = this.userService.loginExists(data.login)
        const emailExists = this.userService.emailExists(data.email)
        if(await loginExists) return AuthError.LoginExists
        if(await emailExists) return AuthError.EmailExists
        return AuthError.NoError
    }
    private async sendConfirmEmail(user:UserModel, confirmCode:string = user.emailConfirmation.code): Promise<boolean> {
        return this.confirmSender.send(
            user.accountData.login,
            user.accountData.email,
            confirmCode)
    }
}