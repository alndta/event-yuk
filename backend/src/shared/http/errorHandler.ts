import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors';
import { logger } from '../logger';

/**
 * One place that turns errors into responses. Only AppError messages and validation issues
 * reach the client; anything unexpected becomes a generic 500 and is logged server-side.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'Data yang dikirim belum valid.',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  const known = err as { type?: string; status?: number };
  if (known?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, code: 'BAD_JSON', error: 'Isi permintaan bukan JSON yang valid.' });
  }
  if (known?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, code: 'PAYLOAD_TOO_LARGE', error: 'Isi permintaan terlalu besar.' });
  }

  logger.error('unhandled error', {
    method: req.method,
    path: req.path,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', error: 'Terjadi kesalahan pada server.' });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'Endpoint tidak ditemukan.' });
}
