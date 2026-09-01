import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { smtpConfig } from '../config/AppConfig';
import Mail, { Attachment } from 'nodemailer/lib/mailer';

interface IMailParams {
    to: string;
    sub: string;
    message: string;
    cc?: string | null;
    bcc?: string | null;
    from?:string
    attachments?: Array<Attachment> | null;
}

class EmailService {
    private transport;

    constructor() {
        try {
            const config : SMTPTransport.Options = {
                host: smtpConfig.host,
                port: Number(smtpConfig.port),
                service: smtpConfig.service,
                auth: {
                    user: smtpConfig.user,
                    pass: smtpConfig.password
                }
            };
            this.transport = nodemailer.createTransport(config)
            console.log("SMTP Server is now connected....")
        } catch(exception) {
            console.log(exception)
            console.log("SMTP Connection Failed")
        }
    }

    sendEmail({to, sub, message, cc=null, bcc=null, from=smtpConfig.formAddress, attachments=null}: IMailParams) {
        try {
            let emailBody: Mail.Options = {
                from: from,
                to: to,
                subject: sub,
                html: message
            }
            if(cc) {
                emailBody.cc = cc;
            }
            if(bcc) {
                emailBody.bcc = bcc;
            }
            if(attachments) {
                emailBody.attachments = attachments;
            }
            return this.transport?.sendMail(emailBody);
        } catch(exception) {
            console.error(exception)
            throw {code: 500, message: "Email Sending Failed..."}
        }
    }
}

export default EmailService;