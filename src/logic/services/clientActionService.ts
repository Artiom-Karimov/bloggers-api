import ClientActionRepository from "../../data/repositories/clientActionRepository";
import ClientActionFactory from "../utils/clientActionFactory";

import { userAuth as config } from '../../config/config'
import { ConfirmEmailModelType, LoginModelType, RegisterModelType, RenewTokenModelType, ResendEmailModelType } from "../models/clientActionTypes";

export default class ClientActionService {
    constructor(
        private readonly clientActionRepo: ClientActionRepository
    ) {}

    public clientActionLimit(ip:string): boolean {
        const fromTime = new Date().getTime() - config.actionLimitTime
        this.clientActionRepo.deleteAllBeforeTime(fromTime)
        const actions = this.clientActionRepo.countByIp(ip,fromTime)
        return actions > config.actionLimit
    }
    public writeRegiterAction(data:RegisterModelType,success:boolean = false) {
        this.clientActionRepo.create(ClientActionFactory.createRegister(data,success))
    }
    public writeResendAction(data:ResendEmailModelType,success:boolean = false,login:string = '') {
        this.clientActionRepo.create(ClientActionFactory.createResend(data,success,login))
    }
    public writeLoginAction(data:LoginModelType,success:boolean = false) {
        this.clientActionRepo.create(ClientActionFactory.createLogin(data,success))
    }
    public writeRenewAction(data:RenewTokenModelType,success:boolean = false,login:string = '') {
        this.clientActionRepo.create(ClientActionFactory.createRenew(data,success,login))
    }
    public writeConfirmAction(data:ConfirmEmailModelType,success:boolean = false) {
        this.clientActionRepo.create(ClientActionFactory.createConfirm(data,success))
    }
}