import "reflect-metadata";
import { inject, injectable } from "inversify";
import { IRecoveryEmailSender } from "../../email/recoveryEmailSender";
import { IRecoveryRepository } from "../interfaces/recoveryRepository";
import { AuthError } from "../models/authError";
import { RecoverPasswordModelType, SetNewPasswordModelType } from "../models/clientActionTypes";
import PasswordRecoveryModel from "../models/passwordRecoveryModel";
import UserService from "./userService";
import { Types } from "../../inversifyTypes";

@injectable()
export default class RecoveryService {
    constructor(
        @inject(Types.RecoveryRepository) private readonly repo: IRecoveryRepository,
        @inject(Types.UserService) private readonly userService: UserService,
        @inject(Types.RecoveryEmailSender) private readonly recoverySender: IRecoveryEmailSender
    ) { }

    public async sendRecoveryEmail(data: RecoverPasswordModelType): Promise<AuthError> {
        const user = await this.userService.getByEmail(data.email)
        if (!user) return AuthError.UserNotFound

        const createdCode = await this.repo.create(PasswordRecoveryModel.create(user.id))
        if (!createdCode) return AuthError.Unknown

        this.recoverySender.send(data.email, createdCode)
        return AuthError.NoError
    }
    public async setNewPassword(data: SetNewPasswordModelType): Promise<AuthError> {
        const recovery = await this.repo.get(data.code)
        if (!recovery || recovery.expiration <= new Date().getTime()) return AuthError.WrongCode

        const user = await this.userService.get(recovery.userId)
        if (!user) return AuthError.UserNotFound

        const updated = await this.userService.setNewPassword(user.id, data.password)
        return updated ? AuthError.NoError : AuthError.Unknown
    }
}