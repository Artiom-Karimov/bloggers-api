import request from 'supertest'
import UserPageViewModel from '../../../data/models/pageViewModels/userPageViewModel'
import { UserInputModel } from '../../../logic/models/userModel'
import TestApp from '../../testAppSetup'
import * as helpers from './routerTestHelpers'

const base = '/users'


const fillSampleData = () => {
    helpers.clearUserSamples()
    for(let i=0;i<20;i++) {
        helpers.sampleUserInputs.push({
            login: `youser ${i+1}`,
            email: `youser${i+1}@poopmail.com`,
            password: `password${i+1}`
        })
    }
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
        const responses = await helpers.createUserSamples()
        responses.forEach((r) => {
            expect(r.id).not.toBeFalsy()
            expect(r.login).not.toBeFalsy()
            expect(r.email).not.toBeFalsy()
            expect(r.createdAt).not.toBeFalsy()
        })
    })

    it('get should return userList', async () => {
        const response = await request(TestApp.server)
            .get(`${base}?pageSize=${helpers.sampleUserInputs.length}`)
        const data = response.body as UserPageViewModel

        expect(data.totalCount).toBe(helpers.sampleUserInputs.length)
        expect(data.pageSize).toBe(helpers.sampleUserInputs.length)
        data.items.forEach((u) => {
            const match = helpers.sampleUserInputs.some((input) => {
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