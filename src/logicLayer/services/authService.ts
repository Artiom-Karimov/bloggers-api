import "reflect-metadata";
import SessionService, { DeviceSessionError } from "./sessionService";
import UserService from "./userService";
import Hasher from "../utils/hasher"
import { LoginModelType, RegisterModelType, ResendEmailModelType, RenewTokenModelType, ConfirmEmailModelType, RecoverPasswordModelType } from "../models/clientActionTypes"
import JwtTokenOperator from "../utils/jwtTokenOperator"
import UserModel from "../models/userModel";
import { IConfirmationEmailSender } from "../../email/confirmationEmailSender";
import { AuthError } from "../models/authError";
import TokenPair from "../models/tokenPair";
import { inject, injectable } from "inversify";
import { Types } from "../../inversifyTypes";

@injectable()
export default class AuthService {

    constructor(
        @inject(Types.UserService) private readonly userService: UserService,
        @inject(Types.SessionService) private readonly sessionService: SessionService,
        @inject(Types.ConfirmEmailSender) private readonly confirmSender: IConfirmationEmailSender
    ) { }
    public async register(data: RegisterModelType): Promise<AuthError> {
        const existsError = await this.loginOrEmailExists(data)
        if (existsError !== AuthError.NoError) return existsError

        const user = await this.createAndGetUser(data)
        if (!user) return AuthError.Unknown

        this.sendConfirmEmail(user)

        return AuthError.NoError
    }
    public async resendConfirmationEmail(data: ResendEmailModelType): Promise<AuthError> {
        const user = await this.userService.getByEmail(data.email)
        if (!user) return AuthError.WrongCredentials

        if (user.emailConfirmation.confirmed) return AuthError.AlreadyConfirmed

        const newCode = await this.userService.renewEmailConfirmation(user.id)
        if (!newCode) return AuthError.Unknown

        this.sendConfirmEmail(user, newCode)

        return AuthError.NoError
    }
    public async confirmRegistration(data: ConfirmEmailModelType): Promise<AuthError> {
        const user = await this.userService.getByLogin(data.login)
        if (!user) return AuthError.UserNotFound

        if (user.emailConfirmation.codeExpiration < new Date().getDate() ||
            data.code !== user.emailConfirmation.code) {
            return AuthError.WrongCode
        }
        if (await this.userService.setEmailConfirmed(user.id)) return AuthError.NoError

        return AuthError.Unknown
    }
    public async confirmRegitrationByCodeOnly(data: ConfirmEmailModelType): Promise<AuthError> {
        const user = await this.userService.getByConfirmCode(data.code)
        if (!user ||
            user.emailConfirmation.codeExpiration < new Date().getDate() ||
            data.code !== user.emailConfirmation.code) {
            return AuthError.WrongCode
        }
        if (await this.userService.setEmailConfirmed(user.id)) return AuthError.NoError

        return AuthError.Unknown
    }
    public async login(data: LoginModelType)
        : Promise<TokenPair | AuthError> {
        const user = await this.userService.getByLogin(data.login)
        if (!user || !await this.checkPassword(user, data.password)) return AuthError.WrongCredentials

        const pair = await this.sessionService.createDevice({
            ip: data.ip, deviceName: data.deviceName, userId: user.id
        })
        if (!pair) return AuthError.Unknown

        return pair
    }
    public async renewTokenPair(data: RenewTokenModelType)
        : Promise<TokenPair | AuthError> {
        const tokenData = JwtTokenOperator.unpackRefreshToken(data.refreshToken)
        if (!tokenData) return AuthError.WrongToken

        const user = await this.userService.get(tokenData.userId)
        if (!user) return AuthError.UserNotFound

        const pair = await this.sessionService.updateDevice(
            tokenData,
            { ip: data.ip, deviceName: data.deviceName, userId: user.id })
        if (!pair) return AuthError.WrongToken

        return pair
    }
    public async logout(refreshToken: string): Promise<boolean> {
        const tokenData = JwtTokenOperator.unpackRefreshToken(refreshToken)
        if (!tokenData) return false
        const user = await this.userService.get(tokenData.userId)
        if (!user) return false

        const deleted = await this.sessionService.deleteDevice(refreshToken, tokenData.deviceId)
        return deleted === DeviceSessionError.NoError
    }
    private async checkPassword(user: UserModel, password: string): Promise<boolean> {
        if (!user.emailConfirmation.confirmed) return false
        return Hasher.check(password, { hash: user.accountData.passwordHash, salt: user.accountData.salt })
    }
    private async createAndGetUser(data: RegisterModelType): Promise<UserModel | undefined> {
        const createdId = await this.userService.createUnconfirmed({
            login: data.login, email: data.email, password: data.password
        })
        if (!createdId) return undefined
        return this.userService.get(createdId)
    }
    private async loginOrEmailExists(data: RegisterModelType): Promise<AuthError> {
        const loginExists = this.userService.loginExists(data.login)
        const emailExists = this.userService.emailExists(data.email)
        if (await loginExists) return AuthError.LoginExists
        if (await emailExists) return AuthError.EmailExists
        return AuthError.NoError
    }
    private async sendConfirmEmail(user: UserModel, confirmCode: string = user.emailConfirmation.code): Promise<boolean> {
        return this.confirmSender.send(
            user.accountData.login,
            user.accountData.email,
            confirmCode)
    }
}