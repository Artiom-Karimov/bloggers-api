import ClientActionRepository from "../../data/repositories/clientActionRepository";
import ClientActionFactory from "../utils/clientActionFactory";

import { userAuth as config } from '../../config/config'
import { ConfirmEmailModelType, LoginModelType, RegisterModelType, RenewTokenModelType, ResendEmailModelType } from "../models/clientActionTypes";

export default class ClientActionService {
    constructor(
        private readonly clientActionRepo: ClientActionRepository
    ) {}

    public async clientActionLimit(ip:string): Promise<boolean> {
        const fromTime = new Date().getTime() - config.actionLimitTime
        this.clientActionRepo.deleteAllBeforeTime(fromTime)
        const actions = await this.clientActionRepo.countByIp(ip,fromTime)
        return actions > config.actionLimit
    }
    public async writeRegiterAction(data:RegisterModelType,success:boolean = false) {
        await this.clientActionRepo.create(ClientActionFactory.createRegister(data,success))
    }
    public async writeResendAction(data:ResendEmailModelType,success:boolean = false,login:string = '') {
        await this.clientActionRepo.create(ClientActionFactory.createResend(data,success,login))
    }
    public async writeLoginAction(data:LoginModelType,success:boolean = false) {
        await this.clientActionRepo.create(ClientActionFactory.createLogin(data,success))
    }
    public async writeRenewAction(data:RenewTokenModelType,success:boolean = false,login:string = '') {
        await this.clientActionRepo.create(ClientActionFactory.createRenew(data,success,login))
    }
    public async writeConfirmAction(data:ConfirmEmailModelType,success:boolean = false) {
        await this.clientActionRepo.create(ClientActionFactory.createConfirm(data,success))
    }
}