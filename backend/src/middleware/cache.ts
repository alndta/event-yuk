import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  body: any;
  contentType: string;
  statusCode: number;
  expiresAt: number;
  etag: string;
}

class MemoryCache {
  private store = new Map<string, CacheEntry>();

  set(key: string, body: any, contentType: string, statusCode: number, ttlSeconds: number): void {
    const etag = `W/"${Buffer.from(JSON.stringify(body || '')).length}-${Date.now()}"`;
    this.store.set(key, {
      body,
      contentType,
      statusCode,
      expiresAt: Date.now() + ttlSeconds * 1000,
      etag,
    });
  }

  get(key: string): CacheEntry | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  purge(urlPrefix?: string): number {
    if (!urlPrefix) {
      const count = this.store.size;
      this.store.clear();
      return count;
    }

    let purgedCount = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(urlPrefix)) {
        this.store.delete(key);
        purgedCount++;
      }
    }
    return purgedCount;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  size(): number {
    return this.store.size;
  }
}

export const memoryCache = new MemoryCache();

// Periodically clean expired items every 2 minutes
setInterval(() => {
  memoryCache.cleanup();
}, 2 * 60 * 1000).unref();

/**
 * Middleware: Cache GET responses in memory & set HTTP Cache-Control headers
 * @param ttlSeconds Time-to-live in seconds (default: 30 seconds)
 */
export function cacheResponse(ttlSeconds = 30) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if authenticated user header or authorization is present to avoid leaking user-specific data
    if (req.headers['authorization'] || req.headers['x-user-id']) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return next();
    }

    const cacheKey = req.originalUrl;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader(
        'Cache-Control',
        `public, max-age=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`
      );
      res.setHeader('ETag', cached.etag);
      res.setHeader('Content-Type', cached.contentType);
      return res.status(cached.statusCode).send(cached.body);
    }

    // Cache MISS: Intercept response to store it
    res.setHeader('X-Cache', 'MISS');
    res.setHeader(
      'Cache-Control',
      `public, max-age=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`
    );

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = (body: any): Response => {
      // Only cache 200 OK responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, body, 'application/json; charset=utf-8', res.statusCode, ttlSeconds);
      }
      return originalJson(body);
    };

    res.send = (body: any): Response => {
      if (res.statusCode >= 200 && res.statusCode < 300 && !memoryCache.get(cacheKey)) {
        const contentType = res.getHeader('Content-Type')?.toString() || 'text/html; charset=utf-8';
        memoryCache.set(cacheKey, body, contentType, res.statusCode, ttlSeconds);
      }
      return originalSend(body);
    };

    next();
  };
}

/**
 * Middleware: Strict no-cache for private/mutation endpoints
 */
export function noCacheMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

/**
 * Invalidate cache programmatically (e.g. after event creation or profile update)
 */
export function invalidateCache(urlPrefix?: string): number {
  return memoryCache.purge(urlPrefix);
}
