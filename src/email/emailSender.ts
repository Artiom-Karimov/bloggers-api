import nodemailer from 'nodemailer'
import { email as config } from '../config/config'

export default abstract class EmailSender {
    protected readonly transporter: nodemailer.Transporter<nodemailer.SentMessageInfo> 

    constructor() {
        this.transporter = nodemailer.createTransport({
            service:'gmail',
            auth: {
                user: config.user,
                pass: config.password
            }
        })        
    }

    protected async sendEmail(subject:string,html:string, ...addresses:string[]): Promise<boolean> {
        try {
                await this.transporter.sendMail({
                from: `"${config.senderName}" <${config.user}>`,
                to: addresses.join(', '),
                subject: subject,
                html: html
            })
            return true
        } catch {
            return false
        }
    }
}