import EmailSender from "./emailSender";
import ConfirmationEmailConstructor from "./confirmationEmailConstructor";
import { injectable } from "inversify";

export interface IConfirmationEmailSender {
    send(login:string,email:string,code:string): Promise<boolean>
}

@injectable()
export default class ConfirmationEmailSender extends EmailSender implements IConfirmationEmailSender {

    constructor() {
        super()
    }
    public async send(login:string,email:string,code:string): Promise<boolean> {
        const html = ConfirmationEmailConstructor.construct(login,code)
        return this.sendEmail('Email confirmation', html, email)
    }
} 