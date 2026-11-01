import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors';
import { langOf, translate } from '../i18n/messages';
import { logger } from '../logger';

/**
 * One place that turns errors into responses. Only AppError messages and validation issues
 * reach the client; anything unexpected becomes a generic 500 and is logged server-side.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const lang = langOf(req);
  const say = (text: string) => translate(text, lang);
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      error: say('Data yang dikirim belum valid.'),
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: say(i.message) })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      error: say(err.message),
      ...(err.details ? { details: err.details } : {}),
    });
  }

  const known = err as { type?: string; status?: number };
  if (known?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, code: 'BAD_JSON', error: say('Isi permintaan bukan JSON yang valid.') });
  }
  if (known?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, code: 'PAYLOAD_TOO_LARGE', error: say('Isi permintaan terlalu besar.') });
  }

  logger.error('unhandled error', {
    method: req.method,
    path: req.path,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', error: say('Terjadi kesalahan pada server.') });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, code: 'NOT_FOUND', error: translate('Endpoint tidak ditemukan.', langOf(req)) });
}
