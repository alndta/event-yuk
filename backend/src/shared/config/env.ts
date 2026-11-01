import { randomBytes } from 'node:crypto';
import { z } from 'zod';

const flag = z
  .string()
  .optional()
  .transform((v) => v === 'true');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  TRUST_PROXY: z.string().optional(),

  JWT_SECRET: z.string().optional(),
  JWT_TTL: z.string().default('12h'),
  ADMIN_EMAILS: z.string().default(''),
  CORS_ORIGINS: z.string().default(''),
  APP_BASE_URL: z.string().default('http://localhost:3000'),

  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: flag,
  PLATFORM_FEE_PCT: z.coerce.number().min(0).max(30).default(2.5),
  /** Days an approved e-KYC photo is kept before it is deleted. Rejected photos are deleted at once. */
  KYC_APPROVED_PHOTO_DAYS: z.coerce.number().int().min(0).max(365).default(30),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_SECURE: z.string().default('true').transform((v) => v !== 'false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  /** Return the OTP in the API response. Honoured outside production only. */
  EXPOSE_OTP_PREVIEW: flag,
});

export interface Env {
  nodeEnv: 'development' | 'test' | 'production';
  isProduction: boolean;
  port: number;
  trustProxy: string | undefined;
  jwtSecret: string;
  jwtTtl: string;
  adminEmails: string[];
  corsOrigins: string[];
  appBaseUrl: string;
  supabaseUrl: string | undefined;
  supabaseServiceRoleKey: string | undefined;
  midtrans: { serverKey?: string; clientKey?: string; isProduction: boolean };
  platformFeePct: number;
  smtp: { host?: string; port: number; secure: boolean; user?: string; pass?: string; from?: string };
  exposeOtpPreview: boolean;
  kycApprovedPhotoDays: number;
}

const list = (v: string) =>
  v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Reads and validates the environment once, at start-up. In production a missing or weak
 * secret stops the process instead of falling back to something guessable.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Konfigurasi environment tidak valid: ${problems}`);
  }
  const e = parsed.data;
  const isProduction = e.NODE_ENV === 'production';

  const missing: string[] = [];
  if (isProduction) {
    if (!e.JWT_SECRET || e.JWT_SECRET.length < 32) missing.push('JWT_SECRET (minimal 32 karakter)');
    if (!e.SUPABASE_URL) missing.push('SUPABASE_URL');
    if (!e.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!e.CORS_ORIGINS) missing.push('CORS_ORIGINS');
  }
  if (missing.length) throw new Error(`Environment wajib diisi untuk production: ${missing.join(', ')}`);

  // Outside production a throwaway secret is fine: sessions simply end when the process restarts.
  const jwtSecret = e.JWT_SECRET && e.JWT_SECRET.length >= 16 ? e.JWT_SECRET : randomBytes(32).toString('hex');

  return {
    nodeEnv: e.NODE_ENV,
    isProduction,
    port: e.PORT,
    trustProxy: e.TRUST_PROXY,
    jwtSecret,
    jwtTtl: e.JWT_TTL,
    adminEmails: list(e.ADMIN_EMAILS).map((s) => s.toLowerCase()),
    corsOrigins: e.CORS_ORIGINS
      ? list(e.CORS_ORIGINS)
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
    appBaseUrl: e.APP_BASE_URL,
    supabaseUrl: e.SUPABASE_URL,
    supabaseServiceRoleKey: e.SUPABASE_SERVICE_ROLE_KEY,
    midtrans: { serverKey: e.MIDTRANS_SERVER_KEY, clientKey: e.MIDTRANS_CLIENT_KEY, isProduction: e.MIDTRANS_IS_PRODUCTION },
    platformFeePct: e.PLATFORM_FEE_PCT,
    smtp: {
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      secure: e.SMTP_SECURE,
      user: e.SMTP_USER,
      pass: e.SMTP_PASS?.replace(/\s+/g, ''),
      from: e.EMAIL_FROM,
    },
    exposeOtpPreview: !isProduction && e.EXPOSE_OTP_PREVIEW,
    kycApprovedPhotoDays: e.KYC_APPROVED_PHOTO_DAYS,
  };
}
