import request from 'supertest'
import { UserInputModel } from '../../logic/models/userModel'
import TestApp from '../testAppSetup'

const base = '/auth'


const createUser = async (login:string,password:string): Promise<string> => {
    const userInput: UserInputModel = {
        login:login,
        email:'whatever@mail.com',
        password:password
    } 
    const created = await request(TestApp.server)
        .post('/users').auth(TestApp.userName, TestApp.password).send(userInput)
    return created.body.id
}

describe('authRouter tests', () => {
    beforeAll(async () => {
        await TestApp.start()
        await request(TestApp.server)
            .delete('/testing/all-data')
    })

    it('wrong credentials should receive 401', async () => {
        const login = 'vasya'
        const password = 'rightPass'
        const user = await createUser(login,password)
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
        const user = await createUser(login,password)
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
        const user = await createUser(login,password)
        const result = await request(TestApp.server)
            .post(`${base}/login`).send({
                login:login,
                password:password
            })
        const token = result.body.accessToken
        const infoResult = await await request(TestApp.server)
            .get(`${base}/me`).set({authorization:`Bearer ${token}`})

        expect(infoResult.statusCode).toBe(200)
        expect(infoResult.body.email).toBeTruthy()
        expect(infoResult.body.login).toBe(login)
        expect(infoResult.body.userId).toBeTruthy()
    })

    afterAll(async () => {
        await TestApp.stop()
    })
})