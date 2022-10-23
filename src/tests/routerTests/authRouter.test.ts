import request from 'supertest'
import { UserInputModel } from '../../logic/models/userModel'
import UserFactory from '../../logic/utils/userFactory'
import * as root from '../testCompositionRoot'
import * as helpers from './routerTestHelpers'

const base = '/auth'

describe('authRouter tests', () => {

    beforeAll(async () => {
        await root.initApp()
        await request(root.app.server)
            .delete('/testing/all-data')    
    })
    afterAll(async () => {
        await root.stopApp()
    })

    describe('basic operations', () => {
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
                }).set({ 'user-agent': 'poopzilla' })
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
    
        it('should block if too many requests', async () => {
            const results:any[] = []
            for(let i=0;i<6;i++) {
                results.push(await request(root.app.server).post(`${base}/login`).send({login:`vasya${i}`,password:'password'}))
            }
            expect(results.some(r => r.statusCode === 429)).toBe(true)
        })
        it('prevent from ip block', async () => {
            await helpers.timeout(3333)
        })
        it('prevent from ip block', async () => {
            await helpers.timeout(3333)
        })
        it('prevent from ip block', async () => {
            await helpers.timeout(3333)
        })
        it('should unblock after timeout', async () => {
            const result = await request(root.app.server).post(`${base}/login`).send({login:`someone`,password:'password'})
            expect(result.statusCode).not.toBe(429)
        })
    })
    

    describe('registration procedure', () => {
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
        it('resendEmail should return 204', async () => {
            const result = await request(root.app.server).post(`${base}/registration-email-resending`).send({email:userData.email})
            expect(result.statusCode).toBe(204)
        })
        it('confirm should return 204', async () => {
            const userModel = await root.userService.getByLogin(userData.login)
            expect(userModel).toBeTruthy()
    
            const confirmed = await request(root.app.server)
                .get(`${base}/confirm-email?user=${userData.login}&code=${userModel!.emailConfirmation.code}`)
            expect(confirmed.statusCode).toBe(204)
        })
    
        it('prevent from ip block', async () => {
            await helpers.timeout(3333)
        })
        it('prevent from ip block', async () => {
            await helpers.timeout(3333)
        })
        it('prevent from ip block', async () => {
            await helpers.timeout(3333)
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
    
    })
    
    
    describe('password recovery procedure', () => {
        it('invalid email should receive 400', async () => {
            const result = await request(root.app.server).post(`${base}/password-recovery`).send({email:'poopmail^..@doomed.com'})
            expect(result.statusCode).toBe(400)
        })
        it('non-existing user should receive 204', async () => {
            const result = await request(root.app.server).post(`${base}/password-recovery`).send({email:'poopster@doomed.com'})
            expect(result.statusCode).toBe(204)
        })
        const sampleUser = {
            login: 'superUser',
            email: 'superLoser@example.com',
            password: 'daFuckIsDaPassword'
        }
        let id:string|undefined
        it('existing user should set code into db', async () => {
            id = await root.userService.createConfirmed(sampleUser)
            const response = await request(root.app.server).post(`${base}/password-recovery`).send({email:sampleUser.email})
            expect(response.statusCode).toBe(204)
            const recovery = await root.recoveryRepository.getByUser(id!)
            expect(recovery.length).toBe(1)
            expect(recovery[0].id).toBeTruthy()
            expect(recovery[0].userId).toBe(id)
            expect(recovery[0].expiration).toBeGreaterThan(new Date().getTime())
        })
        it('wrong code should receive 400', async () => {
            const result = await request(root.app.server).post(`${base}/new-password`).send({newPassword:'privetDroog',recoveryCode:'somethingWntWrongAccidentally'})
            expect(result.statusCode).toBe(400)
        })
        it('right code should receive 204, user should login with new pass', async () => {
            const recovery = (await root.recoveryRepository.getByUser(id!))[0]
            const password = 'privetDroog'
            const result = await request(root.app.server).post(`${base}/new-password`).send({newPassword:password,recoveryCode:recovery.id})
            expect(result.statusCode).toBe(204)
            const loggedIn = await request(root.app.server).post(`${base}/login`).send({login:sampleUser.login,password:password})
            expect(loggedIn.statusCode).toBe(200)
            expect(loggedIn.body.accessToken).toBeTruthy()
        })
    })
    
})