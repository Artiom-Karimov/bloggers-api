import { IConfirmationEmailSender } from "../../email/confirmationEmailSender"
import { IRecoveryEmailSender } from "../../email/recoveryEmailSender"

export const fakeConfirmEmailSender: IConfirmationEmailSender = {
    send(login:string,email:string,code:string): Promise<boolean> {
        return new Promise((resolve, reject) => resolve(true))
    }
}
export const fakeRecoverEmailSender: IRecoveryEmailSender = {
    send: function (email: string, code: string): Promise<boolean> {
        return new Promise((resolve, reject) => resolve(true))
    }
}