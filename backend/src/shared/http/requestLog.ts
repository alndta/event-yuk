import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { logger } from '../logger';

const QUIET = new Set(['/health', '/favicon.ico']);

/**
 * One line per request, written when the response finishes:
 *   POST /api/v1/auth/login 200 42ms user=… id=…
 * Each request also gets an id, returned as X-Request-Id so a user's error can be found in the logs.
 */
export const requestLog: RequestHandler = (req, res, next) => {
  const id = randomUUID().slice(0, 8);
  const started = process.hrtime.bigint();
  res.setHeader('X-Request-Id', id);

  res.on('finish', () => {
    const path = req.originalUrl.split('?')[0] ?? req.originalUrl;
    if (QUIET.has(path)) return;
    const ms = Number((process.hrtime.bigint() - started) / 1_000_000n);
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${path} ${status} ${ms}ms`, {
      id,
      user: req.auth?.userId?.slice(0, 8),
      role: req.auth?.role ?? undefined,
      ip: status >= 400 ? req.ip : undefined,
    });
  });
  next();
};
