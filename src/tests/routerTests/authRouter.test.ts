import request from 'supertest'
import { UserInputModel } from '../../logic/models/userModel'
import * as root from '../testCompositionRoot'
import * as helpers from './routerTestHelpers'

const base = '/auth'

describe('authRouter tests', () => {

    beforeAll(async () => {
        await root.initApp()
        await request(root.app.server)
            .delete('/testing/all-data')    
    })

    it('wrong credentials should receive 401', async () => {
        jest.setTimeout(10000)
        const login = 'vasya'
        const email = 'boo@oob.bo'
        const password = 'rightPass'
        const user = await helpers.createUser(login,email,password)
        const result = await request(root.app.server)
            .post(`${base}/login`).send({
                login:login,
                password:'wrongPass'
            })
        expect(result.statusCode).toBe(401)
    })

    it('right credentials should receive token', async () => {
        jest.setTimeout(10000)
        const login = 'lena'
        const email = 'ema@mail.em'
        const password = 'somePass'
        const user = await helpers.createUser(login,email,password)
        expect(user).toBeTruthy()
        const result = await request(root.app.server)
            .post(`${base}/login`).send({
                login:login,
                password:password
            })
        expect(result.statusCode).toBe(200)
        expect(result.body.accessToken).toBeTruthy()
    })

    it('authorized user should receive himself', async () => {
        jest.setTimeout(10000)
        const login = 'petya'
        const email = 'pe@ty.ea'
        const password = 'daPassword'
        const user = await helpers.createUser(login,email,password)
        const result = await request(root.app.server)
            .post(`${base}/login`).send({
                login:login,
                password:password
            })
        const token = result.body.accessToken
        const infoResult = await request(root.app.server)
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
        jest.setTimeout(10000)   
        const result = await request(root.app.server).post(`${base}/registration`).send(userData)
        expect(result.statusCode).toBe(204)
    })
    it('unconfirmed user should not login', async () => {
        const result = await request(root.app.server)
            .post(`${base}/login`).send({
                login:userData.login,
                password:userData.password
            })
        expect(result.statusCode).toBe(401)
    })
    it('confirm should return 204', async () => {
        const userModel = await root.userService.getByLogin(userData.login)
        expect(userModel).toBeTruthy()

        const confirmed = await request(root.app.server)
            .get(`${base}/confirm-email?user=${userData.login}&code=${userModel!.emailConfirmation.code}`)
        expect(confirmed.statusCode).toBe(204)
    })
    it('right credentials should receive token', async () => {        
        const result = await request(root.app.server)
            .post(`${base}/login`).send({
                login:userData.login,
                password:userData.password
            })
        expect(result.statusCode).toBe(200)
        expect(result.body.accessToken).toBeTruthy()
    })

    // Another registration
    const nextUserData: UserInputModel = {
        login: 'doodkin',
        password: 'lamePass',
        email: 'poke@example.com'
    }
    it('confirm should return 204', async () => {      
        const result = await request(root.app.server).post(`${base}/registration`).send(nextUserData)
        expect(result.statusCode).toBe(204)

        const userModel = await root.userService.getByLogin(nextUserData.login)
        expect(userModel).toBeTruthy()

        const confirmed = await request(root.app.server)
            .post(`${base}/registration-confirmation`).send({code:userModel!.emailConfirmation.code})
        expect(confirmed.statusCode).toBe(204)
    })

    let refreshCookie:string
    it('right credentials should receive token', async () => {        
        const result = await request(root.app.server)
            .post(`${base}/login`).send({
                login:nextUserData.login,
                password:nextUserData.password
            })
        expect(result.statusCode).toBe(200)
        expect(result.body.accessToken).toBeTruthy()
        refreshCookie = helpers.parseRefreshCookie(result.get("Set-Cookie"))
    })

    it('refresh should return refresh token', async () => {
        const result = await request(root.app.server).post(`${base}/refresh-token`).send({}).set('Cookie', [ refreshCookie ])
        expect(result.statusCode).toBe(200)
        const newCookie = helpers.parseRefreshCookie(result.get("Set-Cookie"))
        expect(newCookie).toBeTruthy()
        expect(newCookie.includes('.')).toBe(true)
    })


    afterAll(async () => {
        await root.stopApp()
    })
})