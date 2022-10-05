import request from 'supertest'
import UserPageViewModel from '../../data/models/pageViewModels/userPageViewModel'
import { UserInputModel } from '../../logic/models/userModel'
import TestApp from '../testAppSetup'

const base = '/users'

let sampleUserInputs: Array<UserInputModel>

const fillSampleData = () => {
    sampleUserInputs = []
    for(let i=0;i<20;i++) {
        sampleUserInputs.push({
            login: `youser ${i+1}`,
            email: `youser${i+1}@poopmail.com`,
            password: `password${i+1}`
        })
    }
}
const createSampleUsers = async (): Promise<any[]> => {
    const promises = sampleUserInputs.map((u) => {
        return request(TestApp.server).post(base).auth(TestApp.userName, TestApp.password).send(u)
    })
    const responses = await Promise.all(promises)
    return responses.map(r => r.body)
}

describe('userRouter tests', () => {

    beforeAll(async () => {
        await TestApp.start()
        await request(TestApp.server)
            .delete('/testing/all-data')
        fillSampleData()
    })

    it('should return empty user list', async () => {
        const response = await request(TestApp.server).get(base)
        expect(response.statusCode).toEqual(200)
        const model = response.body as UserPageViewModel
        expect(model.totalCount).toBe(0)
        expect(model.items).toEqual([])
    })

    it('put should return users', async () => {
        const responses = await createSampleUsers()
        responses.forEach((r) => {
            expect(r.id).not.toBeFalsy()
            expect(r.login).not.toBeFalsy()
            expect(r.email).not.toBeFalsy()
            expect(r.createdAt).not.toBeFalsy()
        })
    })

    it('get should return userList', async () => {
        const response = await request(TestApp.server)
            .get(`${base}?pageSize=${sampleUserInputs.length}`)
        const data = response.body as UserPageViewModel

        expect(data.totalCount).toBe(sampleUserInputs.length)
        expect(data.pageSize).toBe(sampleUserInputs.length)
        data.items.forEach((u) => {
            const match = sampleUserInputs.some((input) => {
                return input.login === u.login &&
                        input.email === u.email
            })
            expect(match).toBe(true)
        })
    })

    afterAll(() => {
        TestApp.stop()
    })
})