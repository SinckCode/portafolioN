import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    // Se lee del config con namespace, como el resto del proyecto: ahi viven
    // los defaults. Antes leia SMTP_* de process.env sin default util, asi que
    // un .env incompleto daba un transporte silenciosamente inservible.
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: false, // 587 arranca en claro y sube a TLS con STARTTLS
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });
  }

  private compileTemplate(templateName: string, context: Record<string, any>): string {
    const templatePath = join(__dirname, 'templates', `${templateName}.hbs`);
    const source = readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(source);
    return template(context);
  }

  async sendWelcome(to: string, name: string) {
    const html = this.compileTemplate('welcome', {
      name,
      siteUrl: this.configService.get('FRONTEND_URL'),
    });

    await this.send(to, 'Bienvenido a Angel Onesto Portfolio', html);
  }

  async sendResetPassword(to: string, name: string, token: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password/${token}`;
    const html = this.compileTemplate('reset-password', { name, resetUrl });

    await this.send(to, 'Restablecer contraseña', html);
  }

  async sendVerifyEmail(to: string, name: string, token: string) {
    const verifyUrl = `${this.configService.get('FRONTEND_URL')}/verify-email/${token}`;
    const html = this.compileTemplate('verify-email', { name, verifyUrl });

    await this.send(to, 'Verifica tu email', html);
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        // El remitente es MAIL_FROM, no SMTP_USER. Con un relay como Brevo,
        // SMTP_USER es la credencial de acceso (algo@smtp-brevo.com), no una
        // direccion verificada para enviar: usarla como From hace que el relay
        // rechace el mensaje. MAIL_FROM tiene que ser un remitente dado de alta
        // y verificado en el proveedor.
        from: `"${this.configService.get<string>('mail.fromName')}" <${this.configService.get<string>('mail.from')}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}`, error?.stack);
      throw error;
    }
  }
}
