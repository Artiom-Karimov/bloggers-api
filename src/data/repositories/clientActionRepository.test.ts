import ClientActionModel, { ClientAction } from "../../logic/models/clientActionModel"
import ClientActionFactory from "../../logic/utils/clientActionFactory"
import ClientActionRepository from "./clientActionRepository"

const createDummy = (ip:string,action:ClientAction,timestamp:number):ClientActionModel => {
    return new ClientActionModel(
        ip,
        action,
        timestamp
    )
}

describe('clientActionRepo tests', () => {
    it('should create some records', () => {
        const repo = new ClientActionRepository()
        for (let i = 0; i < 54; i++) {
            repo.create(ClientActionFactory.create('10.10.10.10',ClientAction.ConfirmEmail))   
        }
        expect(repo.countByIp('10.10.10.10',ClientAction.ConfirmEmail)).toBe(54)
        expect(repo.countByIp('10.10.10.10',ClientAction.Login)).toBe(0)
        expect(repo.countByIp('10.10.10.11',ClientAction.ConfirmEmail)).toBe(0)
    })

    it('should delete records before time', () => {
        const repo = new ClientActionRepository()
        const tenSecondsBefore = new Date().getTime() - 10_000
        for (let i = 0; i < 32; i++) {
            repo.create(createDummy('127.0.0.1',ClientAction.RenewToken,tenSecondsBefore))   
        }
        for (let i = 0; i < 32; i++) {
            repo.create(ClientActionFactory.create('127.0.0.1',ClientAction.RenewToken))  
        }
        expect(repo.countByIp('127.0.0.1',ClientAction.RenewToken)).toBe(64)
        repo.deleteAllBeforeTime(tenSecondsBefore + 1)
        expect(repo.countByIp('127.0.0.1',ClientAction.RenewToken)).toBe(32)
    })
})