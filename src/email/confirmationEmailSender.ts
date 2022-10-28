import EmailSender from "./emailSender";
import ConfirmationEmailConstructor from "./confirmationEmailConstructor";
import { injectable } from "inversify";

export interface ConfirmEmailSender {
    send(login:string,email:string,code:string): Promise<boolean>
}

@injectable()
export default class ConfirmationEmailSender extends EmailSender implements ConfirmEmailSender {

    constructor() {
        super()
    }
    public async send(login:string,email:string,code:string): Promise<boolean> {
        const html = ConfirmationEmailConstructor.construct(login,code)
        return this.sendEmail('Email confirmation', html, email)
    }
} 