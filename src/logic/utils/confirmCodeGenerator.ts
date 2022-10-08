import { v4 as uuidv4 } from 'uuid'
import add from 'date-fns/add'
import { email as config } from '../../config/config'

export default class ConfirmCodeGenerator {
    public static generate(): [code:string,expiration:number] {
        const code = uuidv4()
        const expiration = add(new Date(), {minutes: config.confirmExpirationMinutes}).getDate()
        return [code,expiration]
    }
}