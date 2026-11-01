import type { NextFunction, Request, Response } from 'express';

interface Entry {
  body: unknown;
  expiresAt: number;
}

/** Small in-process cache for public GET endpoints. Anything with credentials bypasses it. */
export class ResponseCache {
  private store = new Map<string, Entry>();

  private get(key: string): Entry | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  /** Cache successful JSON responses for `ttlSeconds`. Requests carrying Authorization are never cached. */
  middleware(ttlSeconds: number) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' || req.headers.authorization) {
        res.setHeader('Cache-Control', 'no-store');
        return next();
      }
      const key = req.originalUrl;
      const hit = this.get(key);
      if (hit) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}`);
        return res.json(hit.body);
      }
      const json = res.json.bind(res);
      res.json = (body: unknown) => {
        if (res.statusCode === 200) this.store.set(key, { body, expiresAt: Date.now() + ttlSeconds * 1000 });
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}`);
        return json(body);
      };
      next();
    };
  }

  /** Drop every cached URL that starts with the prefix (or everything if none is given). */
  invalidate(prefix?: string): void {
    for (const key of this.store.keys()) if (!prefix || key.startsWith(prefix)) this.store.delete(key);
  }
}
