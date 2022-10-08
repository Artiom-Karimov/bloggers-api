import EmailSender from "./emailSender";
import ConfirmationEmailConstructor from "./confirmationEmailConstructor";

export default class ConfirmationEmailSender extends EmailSender {

    constructor() {
        super()
    }
    public async send(login:string,email:string,code:string) {
        const html = ConfirmationEmailConstructor.construct(login,code)
        return this.sendEmail('Email confirmation', html, email)
    }
} 