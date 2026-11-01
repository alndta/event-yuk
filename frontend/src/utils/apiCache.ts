/**
 * Client-Side API Caching Utility for Event Yuk
 * Provides memory caching with Stale-While-Revalidate pattern and automatic invalidation.
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const memoryStore = new Map<string, CacheItem<any>>();

/**
 * Fetch with intelligent caching
 * @param url Request URL
 * @param options Standard RequestInit options
 * @param ttlMs Cache validity duration in ms (default: 45,000ms = 45s)
 */
export async function cachedFetch<T = any>(
  url: string,
  options?: RequestInit,
  ttlMs = 45000
): Promise<T> {
  // Only cache GET requests
  const method = (options?.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  }

  const cacheKey = `${url}:${JSON.stringify(options?.headers || {})}`;
  const now = Date.now();
  const cached = memoryStore.get(cacheKey);

  // If cache is fresh, return immediately
  if (cached && now - cached.timestamp < cached.ttlMs) {
    return cached.data as T;
  }

  // Fetch fresh data
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = (await res.json()) as T;

    memoryStore.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttlMs,
    });

    return data;
  } catch (err) {
    // If network fails but we had a stale cache, return stale as fallback
    if (cached) {
      console.warn(`[API Cache] Network error for ${url}, returning stale cached copy.`);
      return cached.data as T;
    }
    throw err;
  }
}

/**
 * Invalidate client cache by URL prefix or key
 */
export function invalidateApiCache(urlPrefix?: string): void {
  if (!urlPrefix) {
    memoryStore.clear();
    return;
  }

  for (const key of memoryStore.keys()) {
    if (key.startsWith(urlPrefix)) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Update cache optimistically
 */
export function updateApiCache<T>(url: string, updater: (prev: T | null) => T): void {
  for (const [key, item] of memoryStore.entries()) {
    if (key.startsWith(url)) {
      memoryStore.set(key, {
        ...item,
        data: updater(item.data),
        timestamp: Date.now(),
      });
    }
  }
}
