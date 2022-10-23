import EmailSender from "./emailSender";
import ConfirmationEmailConstructor from "./confirmationEmailConstructor";

export interface ConfirmEmailSender {
    send(login:string,email:string,code:string): Promise<boolean>
}

export default class ConfirmationEmailSender extends EmailSender implements ConfirmEmailSender {

    constructor() {
        super()
    }
    public async send(login:string,email:string,code:string): Promise<boolean> {
        const html = ConfirmationEmailConstructor.construct(login,code)
        return this.sendEmail('Email confirmation', html, email)
    }
} 