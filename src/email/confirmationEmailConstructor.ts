import { email as config } from '../config/config'

export default class ConfirmationEmailConstructor {
    public static construct(login:string,code:string):string {
        const result =  `<h1>Thank for your registration</h1>\n`
         + `<p>To finish registration please follow the link below:\n`
         + `<a href='${config.linkBase}/auth/confirm-email?user=${login}&code=${code}'>complete registration</a>\n`
         + '</p>'

        return result
    }
}