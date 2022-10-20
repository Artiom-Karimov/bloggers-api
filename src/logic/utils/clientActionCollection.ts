import ClientActionModel, { ClientAction } from "../models/clientActionModel";
import { ClientActionRepository } from "../interfaces/clientActionRepository"

export default class ClientActionCollection implements ClientActionRepository {
    private readonly actions: Array<ClientActionModel> = []

    constructor() {}

    public count(ip:string, action:ClientAction): number {
        return this.actions.filter(a => a.ip === ip && a.action === action).length
    }
    public create(data:ClientActionModel) {
        this.actions.push(data)
    }
    public deleteAllBeforeTime(time:number) {
        const removeIndex = this.findTimeIndex(time)
        this.actions.splice(0,removeIndex)
    }
    private findTimeIndex(time:number):number {
        if(this.actions.length === 0) return 0
        if(this.actions[0].timestamp > time) return 0

        for(let i=0;i<this.actions.length;i++) {
            if(this.actions[i].timestamp >= time)
                return i
        }
        return 0
    }
}