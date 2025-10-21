import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { sendMailOptions } from '../../domain/interfaces/send-mail-options.interface';
import { envVars } from 'src/config';

@Injectable()
export class MailerService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(envVars.RESEND_API_KEY);
  }

  async sendEmail(options: sendMailOptions): Promise<boolean> {
    const { to, subject, htmlBody } = options;

    try {
      const { error } = await this.resend.emails.send({
        from: envVars.MAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: htmlBody,
      });

      if (error) {
        Logger.error(error, 'MailerService');
        return false;
      }

      Logger.log(`Email sent to ${Array.isArray(to) ? to.join(', ') : to}`, 'MailerService');
      return true;
    } catch (error) {
      Logger.error(error, 'MailerService');
      return false;
    }
  }
}
