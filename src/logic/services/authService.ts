import LoginAttemptRepository from "../../data/repositories/loginAttemptRepository";
import DeviceSessionService, { DeviceSessionError } from "./deviceSessionService";
import UserService from "./userService";
import Hasher from "../utils/hasher"
import { LoginModelType } from "../models/loginModel"
import JwtTokenOperator from "../utils/jwtTokenOperator"
import { RenewTokenModelType } from "../models/renewTokenModel"
import UserModel from "../models/userModel";
import { userAuth as config } from "../../config/config";
import LoginAttemptFactory from "../utils/loginAttemptFactory";

export default class AuthService {
    
    constructor(
        private readonly userService: UserService,
        private readonly sessionService: DeviceSessionService,
        private readonly loginAttemptRepo: LoginAttemptRepository
    ) {}
    public async login(data:LoginModelType)
    : Promise<[token:string,refreshToken:string]|undefined> {
        const user = await this.userService.getByLogin(data.login)
        if(!user || !await this.checkPassword(user,data.password)) {
            await this.registerLoginAttempt(data,false)
            return undefined
        }   

        const pair = await this.sessionService.createDevice({
            ip:data.ip, deviceName:data.deviceName, userId:user.id})
        if(!pair) {
            await this.registerLoginAttempt(data,false)
            return undefined
        }
        await this.registerLoginAttempt(data,true)
        return pair
    }
    public async renewTokenPair(data:RenewTokenModelType)
    : Promise<[token:string,refreshToken:string]|undefined> {
        const tokenData = JwtTokenOperator.unpackRefreshToken(data.refreshToken)
        if(!tokenData) return undefined
        const user = await this.userService.get(tokenData.userId)
        if(!user) return undefined

        
        return this.sessionService.updateDevice(
            tokenData, 
            { ip:data.ip, deviceName:data.deviceName, userId:user.id })
    }
    public async logout(refreshToken:string): Promise<boolean> {
        const tokenData = JwtTokenOperator.unpackRefreshToken(refreshToken)
        if(!tokenData) return false
        const user = await this.userService.get(tokenData.userId)
        if(!user) return false
      
        const deleted = await this.sessionService.deleteDevice(refreshToken, user.id)
        return deleted === DeviceSessionError.NoError
    }
    public async loginAttemptsLimit(ip:string): Promise<boolean> {
        const fromTime = new Date().getTime() - config.loginAttemptsTime
        const attempts = await this.loginAttemptRepo.countByIp(ip,fromTime)
        return attempts > config.loginAttempts
    }
    private async checkPassword(user:UserModel,password:string): Promise<boolean> {
        if(!user.emailConfirmation.confirmed) return false
        return Hasher.check(password,user.accountData.passwordHash,user.accountData.salt)
    }
    private async registerLoginAttempt(data:LoginModelType,success:boolean) {
        const attempt = LoginAttemptFactory.create(data,success)
        await this.loginAttemptRepo.create(attempt)
    }
}