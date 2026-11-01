/**
 * One place that talks to the backend. It adds the session token, reads the backend's
 * error format, and tells the app when the session has expired.
 */
const BASE = '/api/v1';
export const TOKEN_KEY = 'event_yuk_token';
export const UNAUTHORIZED_EVENT = 'ey:unauthorized';

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

interface Options {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skip the token for public calls such as login. */
  anonymous?: boolean;
  signal?: AbortSignal;
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function api<T = any>(path: string, { method = 'GET', body, anonymous, signal }: Options = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      signal,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(anonymous ? {} : authHeaders()) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, 'Tidak bisa terhubung ke server. Periksa koneksimu lalu coba lagi.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !anonymous && getToken()) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    const detail = Array.isArray(data?.details) && data.details[0]?.message ? ` ${data.details[0].message}` : '';
    throw new ApiError(res.status, (data?.error || data?.message || `Permintaan gagal (${res.status}).`) + (data?.error && detail ? '' : detail), data?.code);
  }
  return data as T;
}

/** Builds "?a=1&b=2" from the defined values only. */
export const query = (params: Record<string, string | undefined | null>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
  const s = q.toString();
  return s ? `?${s}` : '';
};
