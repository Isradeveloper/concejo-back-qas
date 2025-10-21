import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { sendMailOptions } from '../../domain/interfaces/send-mail-options.interface';
import { envVars } from 'src/config';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      pool: true,
      secure: true,
      auth: {
        user: envVars.MAIL_USER,
        pass: envVars.MAIL_PASSWORD,
      },
      maxConnections: 1, // 🔹 Gmail no tolera varias
      maxMessages: 3, // 🔹 Reabre después de pocos correos
      rateDelta: 2000, // milisegundos entre mensajes
      rateLimit: 1, // máximo 1 por rateDelta
      tls: { rejectUnauthorized: false },
    });
  }

  async sendEmail(options: sendMailOptions): Promise<boolean> {
    const { to, subject, htmlBody } = options;

    try {
      await this.transporter.sendMail({
        to,
        subject,
        html: htmlBody,
      });

      Logger.log(`Email sent to ${Array.isArray(to) ? to.join(', ') : to}`, 'MailerService');

      return true;
    } catch (error) {
      Logger.error(error, 'MailerService');
      return false;
    }
  }
}
