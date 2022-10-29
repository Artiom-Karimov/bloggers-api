import { injectable } from "inversify"
import EmailSender from "./emailSender"
import RecoveryEmailConstructor from "./recoveryEmailConstructor"

export interface IRecoveryEmailSender {
    send(email:string,code:string): Promise<boolean>
}

@injectable()
export default class RecoveryEmailSender extends EmailSender implements IRecoveryEmailSender {

    constructor() {
        super()
    }
    public async send(email:string,code:string): Promise<boolean> {
        const html = RecoveryEmailConstructor.construct(code)
        return this.sendEmail('Password recovery', html, email)
    }
} 