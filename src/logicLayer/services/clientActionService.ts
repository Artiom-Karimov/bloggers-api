import "reflect-metadata";
import { IClientActionRepository } from "../interfaces/clientActionRepository";
import ClientActionFactory from "../utils/clientActionFactory";

import { userAuth as config } from '../../config/config'
import { ClientAction } from "../models/clientActionModel";
import { inject, injectable } from "inversify";
import { Types } from "../../inversifyTypes";

@injectable()
export default class ClientActionService {
    constructor(
        @inject(Types.ClientActionRepository) private readonly clientActionRepo: IClientActionRepository
    ) {}

    public updateAndCheckLimit(ip:string,action:ClientAction): boolean {
        this.clientActionRepo.create(ClientActionFactory.create(ip,action))
        this.flushOutdated()
        return this.checkLimit(ip,action)
    }
    private flushOutdated() {
        const fromTime = new Date().getTime() - config.actionLimitTime
        this.clientActionRepo.deleteAllBeforeTime(fromTime)
    }
    private checkLimit(ip:string,action:ClientAction): boolean {
        const actions = this.clientActionRepo.count(ip,action)
        return actions > config.actionLimit
    }
}