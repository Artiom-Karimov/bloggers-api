import { EmailConfirmation } from "../models/userModel"
import { v4 as uuidv4 } from 'uuid'
import add from 'date-fns/add'
import { email as config } from '../../config/config'

export default class EmailConfirmationFactory {
    public static getNew(): EmailConfirmation {
        const [code,expiration] = EmailConfirmationFactory.generate()
        return {
            confirmed:false,
            code:code,
            codeExpiration:expiration
        }
    }
    public static getConfirmed(): EmailConfirmation {
        return {
            confirmed:true,
            code:'<none>',
            codeExpiration:0
        }
    }
    private static generate(): [code:string,expiration:number] {
        const code = uuidv4()
        const expiration = add(new Date(), {minutes: config.confirmExpirationMinutes}).getTime()
        return [code,expiration]
    }
}