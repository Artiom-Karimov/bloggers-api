import "reflect-metadata";
import { inject, injectable } from "inversify";
import { IRecoveryEmailSender } from "../../email/recoveryEmailSender";
import { IRecoveryRepository } from "../interfaces/recoveryRepository";
import { AuthError } from "../models/authError";
import { ClientAction } from "../models/clientActionModel";
import { RecoverPasswordModelType, SetNewPasswordModelType } from "../models/clientActionTypes";
import PasswordRecoveryModel from "../models/passwordRecoveryModel";
import ClientActionService from "./clientActionService";
import UserService from "./userService";
import { Types } from "../../inversifyTypes";

@injectable()
export default class RecoveryService {
    constructor(
        @inject(Types.RecoveryRepository) private readonly repo: IRecoveryRepository,
        @inject(Types.ClientActionService) private readonly actionService: ClientActionService,
        @inject(Types.UserService) private readonly userService: UserService,
        @inject(Types.RecoveryEmailSender) private readonly recoverySender: IRecoveryEmailSender
        ) {}

    public async sendRecoveryEmail(data:RecoverPasswordModelType): Promise<AuthError> {
        if(this.actionService.updateAndCheckLimit(data.ip,ClientAction.RecoverPassword)) return AuthError.ActionLimit

        const user = await this.userService.getByEmail(data.email)
        if(!user) return AuthError.UserNotFound

        const createdCode = await this.repo.create(PasswordRecoveryModel.create(user.id))
        if(!createdCode) return AuthError.Unknown

        this.recoverySender.send(data.email,createdCode)
        return AuthError.NoError
    }
    public async setNewPassword(data:SetNewPasswordModelType): Promise<AuthError> {
        if(this.actionService.updateAndCheckLimit(data.ip,ClientAction.SetNewPassword)) return AuthError.ActionLimit

        const recovery = await this.repo.get(data.code)
        if(!recovery || recovery.expiration <= new Date().getTime()) return AuthError.WrongCode

        const user = await this.userService.get(recovery.userId)
        if(!user) return AuthError.UserNotFound

        const updated = await this.userService.setNewPassword(user.id,data.password)
        return updated ? AuthError.NoError : AuthError.Unknown
    }
}