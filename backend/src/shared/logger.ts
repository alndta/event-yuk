type Level = 'debug' | 'info' | 'warn' | 'error';

const SECRET_KEYS = /pass(word)?|secret|token|authorization|otp|key|signature/i;

/** Drops anything that looks like a credential before it reaches the logs. */
function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SECRET_KEYS.test(k) ? '[redacted]' : redact(v, depth + 1)])
  );
}

function write(level: Level, message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'test' && level !== 'error') return;
  const line = { level, time: new Date().toISOString(), message, ...(context ? (redact(context) as object) : {}) };
  (level === 'error' ? console.error : console.log)(JSON.stringify(line));
}

export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => write('debug', m, c),
  info: (m: string, c?: Record<string, unknown>) => write('info', m, c),
  warn: (m: string, c?: Record<string, unknown>) => write('warn', m, c),
  error: (m: string, c?: Record<string, unknown>) => write('error', m, c),
};
