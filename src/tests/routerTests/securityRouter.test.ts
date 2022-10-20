import request from 'supertest'
import DeviceSessionViewModel from '../../presentation/models/viewModels/deviceSessionViewModel'
import * as root from '../testCompositionRoot'
import * as helpers from './routerTestHelpers'

describe('securityRouter tests', () => {
    beforeAll(async () => {
        await root.initApp()
        await request(root.app.server)
            .delete('/testing/all-data')    
    })
    afterAll(async () => {
        await root.stopApp()
    })

    let refreshCookies: string[]

    it('should get session list', async () => {
        const login = 'emelya'
        const email = 'e.melya@example.com'
        const password = 'daPassword'
        const userId = await helpers.createUser(login,email,password)

        let promises: Promise<any>[] = []
        for(let i=0;i<4;i++) {
            promises.push(request(root.app.server)
            .post(`/auth/login`).send({
                login:login,
                password:password
            }))
        }
        const results = await Promise.all(promises)

        refreshCookies = results.map(r => helpers.parseRefreshCookie(r.get("Set-Cookie")))

        const response = await request(root.app.server).get(`/security/devices`).set('Cookie', [ refreshCookies[0] ])
        expect(response.statusCode).toBe(200)
        const sessions = response.body as DeviceSessionViewModel[]
        expect(sessions).toBeTruthy()
        expect(sessions.length).toBe(4)
    })

    it('should delete one session and return others', async () => {
        let sessionsResponse = await request(root.app.server).get(`/security/devices`).set('Cookie', [ refreshCookies[0] ])
        let sessions = sessionsResponse.body as DeviceSessionViewModel[]
        const initLength = sessions.length
        const removedSession = sessions[sessions.length - 1]

        const removeResponse = await request(root.app.server)
            .delete(`/security/devices/${removedSession.deviceId}`).set('Cookie', [ refreshCookies[0] ])
        expect(removeResponse.statusCode).toBe(204)

        let response = await request(root.app.server).get(`/security/devices`).set('Cookie', [ refreshCookies[0] ])
        if(response.statusCode !== 200) {
            response = await request(root.app.server).get(`/security/devices`).set('Cookie', [ refreshCookies[1] ])
        }

        expect(response.statusCode).toBe(200)
        sessions = response.body as DeviceSessionViewModel[]
        expect(sessions.length).toBe(initLength - 1)
    })
})