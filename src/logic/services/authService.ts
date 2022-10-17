import LoginAttemptRepository from "../../data/repositories/clientActionRepository";
import DeviceSessionService, { DeviceSessionError } from "./deviceSessionService";
import UserService from "./userService";
import Hasher from "../utils/hasher"
import { LoginModelType, RegisterModelType, ResendEmailModelType, RenewTokenModelType, ConfirmEmailModelType } from "../models/clientActionTypes"
import JwtTokenOperator from "../utils/jwtTokenOperator"
import UserModel from "../models/userModel";
import { userAuth as config } from "../../config/config";
import ClientActionFactory from "../utils/clientActionFactory";
import { ConfirmEmailSender } from "../../email/confirmationEmailSender";
import { AuthError } from "../models/authError";
import TokenPair from "../models/tokenPair";

export default class AuthService {
    
    constructor(
        private readonly userService: UserService,
        private readonly sessionService: DeviceSessionService,
        private readonly clientActionRepo: LoginAttemptRepository,
        private readonly confirmSender: ConfirmEmailSender
    ) {}
    public async register(data:RegisterModelType): Promise<AuthError> {
        if(await this.clientActionLimit(data.ip)) {
            this.writeRegiterAction(data)
            return AuthError.ActionLimit
        }
        const existsError = await this.loginOrEmailExists(data)
        if(existsError !== AuthError.NoError) {
            this.writeRegiterAction(data)
            return existsError
        }
        const user = await this.createAndGetUser(data)
        if(!user) {
            this.writeRegiterAction(data)
            return AuthError.Unknown
        }

        this.sendConfirmEmail(user)
        this.writeRegiterAction(data,true)

        return AuthError.NoError
    }
    public async resendConfirmationEmail(data:ResendEmailModelType): Promise<AuthError> {
        if(await this.clientActionLimit(data.ip)) {
            this.writeResendAction(data)
            return AuthError.ActionLimit
        }
        const user = await this.userService.getByEmail(data.email)
        if(!user) {
            this.writeResendAction(data)
            return AuthError.WrongCredentials
        }
        if(user.emailConfirmation.confirmed) {
            this.writeResendAction(data,false,user.accountData.login)
            return AuthError.AlreadyConfirmed
        }
        const newCode = await this.userService.renewEmailConfirmation(user.id)
        if(!newCode) {
            this.writeResendAction(data,false,user.accountData.login)
            return AuthError.Unknown
        }
        this.sendConfirmEmail(user,newCode)

        this.writeResendAction(data,true,user.accountData.login)

        return AuthError.NoError
    }
    public async confirmRegistration(data:ConfirmEmailModelType): Promise<AuthError> {
        if(await this.clientActionLimit(data.ip)) {
            this.writeConfirmAction(data)
            return AuthError.ActionLimit
        }
        const user = await this.userService.getByLogin(data.login)
        if(!user) {
            this.writeConfirmAction(data)
            return AuthError.UserNotFound
        }
        if(user.emailConfirmation.codeExpiration < new Date().getDate() || 
            data.code !== user.emailConfirmation.code) {
                this.writeConfirmAction(data)
                return AuthError.WrongCode
        }
        if(await this.userService.setEmailConfirmed(user.id)) {
            this.writeConfirmAction(data,true)
            return AuthError.NoError
        }
        this.writeConfirmAction(data)
        return AuthError.Unknown
    }
    public async confirmRegitrationByCodeOnly(data:ConfirmEmailModelType): Promise<AuthError> {
        if(await this.clientActionLimit(data.ip)) {
            this.writeConfirmAction(data)
            return AuthError.ActionLimit
        }
        const user = await this.userService.getByConfirmCode(data.code)
        if(!user || 
            user.emailConfirmation.codeExpiration < new Date().getDate() || 
            data.code !== user.emailConfirmation.code) {
                this.writeConfirmAction(data)
                return AuthError.WrongCode
        }
        if(await this.userService.setEmailConfirmed(user.id)) {
            this.writeConfirmAction(data,true)
            return AuthError.NoError
        }
        this.writeConfirmAction(data)
        return AuthError.Unknown
    }
    public async login(data:LoginModelType)
    : Promise<TokenPair|AuthError> {
        if(await this.clientActionLimit(data.ip)) {
            this.writeLoginAction(data)
            return AuthError.ActionLimit
        }
        const user = await this.userService.getByLogin(data.login)
        if(!user || !await this.checkPassword(user,data.password)) {
            this.writeLoginAction(data)
            return AuthError.WrongCredentials
        }   

        const pair = await this.sessionService.createDevice({
            ip:data.ip, deviceName:data.deviceName, userId:user.id})
        if(!pair) {
            this.writeLoginAction(data)
            return AuthError.Unknown
        }
        this.writeLoginAction(data,true)
        return pair
    }
    public async renewTokenPair(data:RenewTokenModelType)
    : Promise<TokenPair|AuthError> {
        if(await this.clientActionLimit(data.ip)) {
            this.writeRenewAction(data)
            return AuthError.ActionLimit
        }
        const tokenData = JwtTokenOperator.unpackRefreshToken(data.refreshToken)
        if(!tokenData) {
            this.writeRenewAction(data)
            return AuthError.WrongToken
        }
        const user = await this.userService.get(tokenData.userId)
        if(!user) {
            this.writeRenewAction(data)
            return AuthError.UserNotFound
        }

        const pair = await this.sessionService.updateDevice(
            tokenData, 
            { ip:data.ip, deviceName:data.deviceName, userId:user.id })
        if(!pair) {
            this.writeRenewAction(data,false,user.accountData.login)
            return AuthError.WrongToken
        }
        this.writeRenewAction(data,true,user.accountData.login)
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
    public async clientActionLimit(ip:string): Promise<boolean> {
        const fromTime = new Date().getTime() - config.actionLimitTime
        const actions = await this.clientActionRepo.countByIp(ip,fromTime)
        return actions > config.actionLimit
    }
    private async checkPassword(user:UserModel,password:string): Promise<boolean> {
        if(!user.emailConfirmation.confirmed) return false
        return Hasher.check(password,user.accountData.passwordHash,user.accountData.salt)
    }
    private async writeRegiterAction(data:RegisterModelType,success:boolean = false) {
        await this.clientActionRepo.create(ClientActionFactory.createRegister(data,success))
    }
    private async writeResendAction(data:ResendEmailModelType,success:boolean = false,login:string = '') {
        await this.clientActionRepo.create(ClientActionFactory.createResend(data,success,login))
    }
    private async writeLoginAction(data:LoginModelType,success:boolean = false) {
        await this.clientActionRepo.create(ClientActionFactory.createLogin(data,success))
    }
    private async writeRenewAction(data:RenewTokenModelType,success:boolean = false,login:string = '') {
        await this.clientActionRepo.create(ClientActionFactory.createRenew(data,success,login))
    }
    private async writeConfirmAction(data:ConfirmEmailModelType,success:boolean = false) {
        await this.clientActionRepo.create(ClientActionFactory.createConfirm(data,success))
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