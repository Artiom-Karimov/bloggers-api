import ClientActionModel from "../../logic/models/clientActionModel";

export default class ClientActionRepository {
    private readonly actions: Array<ClientActionModel> = []

    constructor() {}

    public countByIp(ip:string, fromTime:number): number {
        return this.actions.filter(a => a.ip === ip && a.timestamp >= fromTime).length
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
                return i === 0 ? 0 : i - 1
        }
        return 0
    }
}