import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * 1. RATE LIMITING (DDoS, DoS, & Brute-Force Prevention)
 */

// General API Rate Limiter
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 requests per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Terlalu banyak permintaan dari alamat IP Anda. Silakan coba kembali setelah 15 menit.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// Strict Rate Limiter for Authentication & OTP (Anti Brute-Force & Anti Credential-Stuffing)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Batas percobaan autentikasi / OTP terlampaui. Silakan tunggu 15 menit sebelum mencoba kembali.',
    code: 'AUTH_BRUTE_FORCE_BLOCKED',
  },
});

// Proposal & Transaction Limiter (Anti Spamming & DoS)
export const proposalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Batas frekuensi pengajuan proposal tercapai. Silakan coba beberapa saat lagi.',
    code: 'PROPOSAL_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * 2. XSS & SCRIPT INJECTION SANITIZER
 * Strips script tags, onload/onerror handlers, javascript: pseudo-protocols, and null bytes recursively.
 */
function sanitizeString(val: string): string {
  if (typeof val !== 'string') return val;

  return val
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: and vbscript: URIs
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    // Remove inline event handlers (e.g. onerror=, onload=, onclick=)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    // Remove dangerous HTML tags (iframe, object, embed, applet)
    .replace(/<\/?(iframe|object|embed|applet|meta|link|style)[^>]*>/gi, '')
    .trim();
}

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    if (typeof obj === 'string') return sanitizeString(obj);
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key name against prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    cleanObj[key] = sanitizeObject(value);
  }
  return cleanObj;
}

export function xssSanitizerMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
}

/**
 * 3. HTTP PARAMETER POLLUTION (HPP) GUARD
 * Prevents multiple parameters with the same name from being treated as arrays when strings are expected.
 */
export function parameterPollutionGuard(whitelist: string[] = []) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value) && !whitelist.includes(key)) {
          // Keep only the first parameter
          req.query[key] = value[0];
        }
      }
    }
    next();
  };
}

/**
 * 4. STANDARDIZED SAFE ERROR HANDLER
 * Prevents stack traces, database schema leaks, or environment credentials from being returned to clients.
 */
export function safeErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Event-Yuk Error]', err);

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  res.status(statusCode).json({
    success: false,
    error: isProduction && statusCode === 500 ? 'Internal Server Error' : message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
