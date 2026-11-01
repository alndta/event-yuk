import nodemailer from 'nodemailer';
import type { Env } from '../config/env';
import { logger } from '../logger';

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

/** Escape text that came from a user before it goes into an HTML email. */
export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

class SmtpMailer implements Mailer {
  private transport;
  constructor(private readonly env: Env) {
    this.transport = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  async send(m: MailMessage) {
    await this.transport.sendMail({ from: this.env.smtp.from ?? `"Event Yuk" <${this.env.smtp.user}>`, ...m });
  }
}

/** Used when SMTP is not configured: development logs the mail, production refuses to pretend it was sent. */
class UnconfiguredMailer implements Mailer {
  constructor(private readonly isProduction: boolean) {}
  async send(m: MailMessage) {
    if (this.isProduction) throw new Error('SMTP belum dikonfigurasi.');
    logger.info('mail (not sent, SMTP not configured)', { to: m.to, subject: m.subject });
  }
}

export function createMailer(env: Env): Mailer {
  const { host, user, pass } = env.smtp;
  return host && user && pass ? new SmtpMailer(env) : new UnconfiguredMailer(env.isProduction);
}
