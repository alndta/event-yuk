import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const smtpUser = process.env.SMTP_USER || 'sundaairland@gmail.com';
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || `"Event Yuk Official" <${smtpUser}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
    });
    console.log(`[EMAIL] Email sent to ${to}: messageId = ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[EMAIL_ERROR] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
