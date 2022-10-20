import ClientActionModel, { ClientAction } from "../models/clientActionModel"
import ClientActionFactory from "./clientActionFactory"
import ClientActionCollection from "./clientActionCollection"

const createDummy = (ip:string,action:ClientAction,timestamp:number):ClientActionModel => {
    return new ClientActionModel(
        ip,
        action,
        timestamp
    )
}

describe('clientActionRepo tests', () => {
    it('should create some records', () => {
        const repo = new ClientActionCollection()
        for (let i = 0; i < 54; i++) {
            repo.create(ClientActionFactory.create('10.10.10.10',ClientAction.ConfirmEmail))   
        }
        expect(repo.count('10.10.10.10',ClientAction.ConfirmEmail)).toBe(54)
        expect(repo.count('10.10.10.10',ClientAction.Login)).toBe(0)
        expect(repo.count('10.10.10.11',ClientAction.ConfirmEmail)).toBe(0)
    })

    it('should delete records before time', () => {
        const repo = new ClientActionCollection()
        const tenSecondsBefore = new Date().getTime() - 10_000
        for (let i = 0; i < 32; i++) {
            repo.create(createDummy('127.0.0.1',ClientAction.RenewToken,tenSecondsBefore))   
        }
        for (let i = 0; i < 32; i++) {
            repo.create(ClientActionFactory.create('127.0.0.1',ClientAction.RenewToken))  
        }
        expect(repo.count('127.0.0.1',ClientAction.RenewToken)).toBe(64)
        repo.deleteAllBeforeTime(tenSecondsBefore + 1)
        expect(repo.count('127.0.0.1',ClientAction.RenewToken)).toBe(32)
    })
})