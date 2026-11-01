import type { NextFunction, Request, Response } from 'express';
import { forbidden, unauthorized } from '../errors';
import type { AuthContext, Authenticator, Role } from '../types';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthContext;
  }
}

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

/** The authenticated caller, or a 401. Use inside handlers behind requireAuth. */
export function currentAuth(req: Request): AuthContext {
  if (!req.auth) throw unauthorized();
  return req.auth;
}

/**
 * Builds the auth guards once from an Authenticator. Identity always comes from a signed
 * token; request headers such as x-user-id are never trusted.
 */
export function createAuthGuards(authenticator: Authenticator, adminEmails: string[]) {
  const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = bearerToken(req);
      if (!token) throw unauthorized();
      const auth = await authenticator.authenticate(token);
      if (!auth) throw unauthorized('Sesi tidak valid atau sudah berakhir. Silakan masuk lagi.');
      req.auth = auth;
      next();
    } catch (err) {
      next(err);
    }
  };

  /** Like requireAuth, but anonymous callers pass through with no req.auth. */
  const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = bearerToken(req);
      if (token) req.auth = (await authenticator.authenticate(token)) ?? undefined;
      next();
    } catch (err) {
      next(err);
    }
  };

  const requireRole =
    (...roles: Role[]) =>
    (req: Request, _res: Response, next: NextFunction) => {
      const auth = req.auth;
      if (!auth) return next(unauthorized());
      if (!auth.role || !roles.includes(auth.role)) {
        return next(forbidden(`Fitur ini hanya untuk peran: ${roles.join(', ')}.`));
      }
      next();
    };

  const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
    const auth = req.auth;
    if (!auth) return next(unauthorized());
    if (!adminEmails.includes(auth.email.toLowerCase())) return next(forbidden());
    next();
  };

  return { requireAuth, optionalAuth, requireRole, requireAdmin };
}

export type AuthGuards = ReturnType<typeof createAuthGuards>;
