import cors from 'cors';
import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Env } from '../config/env';
import { langOf, translate } from '../i18n/messages';

/** Security headers for the API. The docs page loosens only what Swagger UI needs. */
export const securityHeaders = (): RequestHandler => helmet();
export const docsSecurityHeaders = (): RequestHandler =>
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  });

/** Only the origins in CORS_ORIGINS get cross-origin access; same-origin and server-to-server calls are unaffected. */
export const corsPolicy = (env: Env): RequestHandler =>
  cors({
    origin: (origin, callback) => callback(null, !origin || env.corsOrigins.includes(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    maxAge: 600,
  });

const limiter = (windowMs: number, max: number, message: string, key?: RequestHandler | ((req: never) => string)) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ success: false, code: 'RATE_LIMITED', error: translate(message, langOf(req)) });
    },
    ...(key ? { keyGenerator: key as never } : {}),
  });

const MIN = 60 * 1000;

export const generalLimiter = () => limiter(15 * MIN, 300, 'Terlalu banyak permintaan. Coba lagi beberapa menit lagi.');
export const authLimiter = () => limiter(15 * MIN, 30, 'Terlalu banyak percobaan masuk. Tunggu 15 menit lalu coba lagi.');

/** Per-email limit for sign-in and OTP so one account cannot be hammered from many addresses. */
export const perEmailLimiter = (max: number, windowMinutes: number, message: string) =>
  limiter(windowMinutes * MIN, max, message, ((req: { body?: { email?: unknown; identifier?: unknown } }) => {
    const raw = req.body?.email ?? req.body?.identifier;
    return `email:${typeof raw === 'string' ? raw.trim().toLowerCase() : 'unknown'}`;
  }) as never);

export const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};
