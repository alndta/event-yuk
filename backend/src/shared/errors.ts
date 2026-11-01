/** An error whose message is safe to show to the client. Everything else becomes a generic 500. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (message: string, details?: unknown) => new AppError(400, 'BAD_REQUEST', message, details);
export const unauthorized = (message = 'Silakan masuk terlebih dahulu.') => new AppError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'Kamu tidak punya akses ke sumber daya ini.') => new AppError(403, 'FORBIDDEN', message);
export const notFound = (message = 'Data tidak ditemukan.') => new AppError(404, 'NOT_FOUND', message);
export const conflict = (message: string) => new AppError(409, 'CONFLICT', message);
export const tooManyRequests = (message: string) => new AppError(429, 'TOO_MANY_REQUESTS', message);
export const badGateway = (message: string) => new AppError(502, 'BAD_GATEWAY', message);
export const serviceUnavailable = (message: string) => new AppError(503, 'SERVICE_UNAVAILABLE', message);
