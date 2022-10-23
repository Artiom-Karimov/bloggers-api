import { email as config } from '../config/config'

export default class RecoveryEmailConstructor {
    public static construct(code:string):string {
        const result =  `<h1>Password recovery</h1>\n`
         + `<p>To finish password recovery please follow the link below:\n`
         + `<a href='${config.linkBase}/auth/new-password?recoveryCode=${code}'>create new password</a>\n`
         + '</p>'

        return result
    }
}