import request from 'supertest'
import { UserInputModel } from '../../../logic/models/userModel'
import TestApp from '../../testAppSetup'
import * as helpers from './routerTestHelpers'
import UserService from '../../../logic/services/userService'

const base = '/auth'

describe('authRouter tests', () => {
    beforeAll(async () => {
        await TestApp.start()
        await request(TestApp.server)
            .delete('/testing/all-data')
    })

    it('wrong credentials should receive 401', async () => {
        const login = 'vasya'
        const password = 'rightPass'
        const user = await helpers.createUser(login,password)
        const result = await request(TestApp.server)
            .post(`${base}/login`).send({
                login:login,
                password:'wrongPass'
            })
        expect(result.statusCode).toBe(401)
    })

    it('right credentials should receive token', async () => {
        const login = 'lena'
        const password = 'somePass'
        const user = await helpers.createUser(login,password)
        const result = await request(TestApp.server)
            .post(`${base}/login`).send({
                login:login,
                password:password
            })
        expect(result.statusCode).toBe(200)
        expect(result.body.accessToken).toBeTruthy()
    })

    it('authorized user should receive himself', async () => {
        const login = 'petya'
        const password = 'daPassword'
        const user = await helpers.createUser(login,password)
        const result = await request(TestApp.server)
            .post(`${base}/login`).send({
                login:login,
                password:password
            })
        const token = result.body.accessToken
        const infoResult = await request(TestApp.server)
            .get(`${base}/me`).set({authorization:`Bearer ${token}`})

        expect(infoResult.statusCode).toBe(200)
        expect(infoResult.body.email).toBeTruthy()
        expect(infoResult.body.login).toBe(login)
        expect(infoResult.body.userId).toBeTruthy()
    })

    // Registration procedure
    const userData: UserInputModel = {
        login: 'poopkin',
        password: 'dateOfBirth',
        email: 'none@example.com'
    }
    it('register should return 204', async () => {      
        const result = await request(TestApp.server).post(`${base}/registration`).send(userData)
        expect(result.statusCode).toBe(204)
    })
    it('unconfirmed user should not login', async () => {
        const result = await request(TestApp.server)
            .post(`${base}/login`).send({
                login:userData.login,
                password:userData.password
            })
        expect(result.statusCode).toBe(401)
    })
    it('confirm should return 204', async () => {
        const userModel = await new UserService().getByLogin(userData.login)
        expect(userModel).toBeTruthy()

        const confirmed = await request(TestApp.server)
            .get(`${base}/confirm-email?user=${userData.login}&code=${userModel!.emailConfirmation.code}`)
        expect(confirmed.statusCode).toBe(204)
    })
    it('right credentials should receive token', async () => {        
        const result = await request(TestApp.server)
            .post(`${base}/login`).send({
                login:userData.login,
                password:userData.password
            })
        expect(result.statusCode).toBe(200)
        expect(result.body.accessToken).toBeTruthy()
    })

    afterAll(async () => {
        await TestApp.stop()
    })
})