type Level = 'debug' | 'info' | 'warn' | 'error';

const RANK: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const SECRET_KEYS = /pass(word)?|secret|token|authorization|otp|key|signature/i;

/** Drops anything that looks like a credential before it reaches the logs. */
function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SECRET_KEYS.test(k) ? '[redacted]' : redact(v, depth + 1)])
  );
}

const minLevel = (): Level => {
  const wanted = (process.env.LOG_LEVEL ?? '').toLowerCase() as Level;
  if (wanted in RANK) return wanted;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

// Readable output for people in development; one JSON object per line for log tools in production.
const pretty = () => process.env.NODE_ENV !== 'production' && process.env.LOG_FORMAT !== 'json';
const color = () => process.stdout.isTTY && !process.env.NO_COLOR;

const paint = (code: string, text: string) => (color() ? `\x1b[${code}m${text}\x1b[0m` : text);
const LEVEL_STYLE: Record<Level, { label: string; code: string }> = {
  debug: { label: 'DEBUG', code: '90' },
  info: { label: 'INFO ', code: '36' },
  warn: { label: 'WARN ', code: '33' },
  error: { label: 'ERROR', code: '31;1' },
};

const formatValue = (v: unknown) => {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return /\s/.test(s) ? JSON.stringify(s) : s;
};

function write(level: Level, message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'test' && level !== 'error') return;
  if (RANK[level] < RANK[minLevel()]) return;
  const safe = context ? (redact(context) as Record<string, unknown>) : undefined;
  const out = level === 'error' ? console.error : console.log;

  if (!pretty()) {
    out(JSON.stringify({ level, time: new Date().toISOString(), message, ...safe }));
    return;
  }
  const time = paint('90', new Date().toTimeString().slice(0, 8));
  const { label, code } = LEVEL_STYLE[level];
  const extras = safe
    ? Object.entries(safe)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${paint('90', k + '=')}${formatValue(v)}`)
        .join(' ')
    : '';
  out(`${time} ${paint(code, label)} ${message}${extras ? '  ' + extras : ''}`);
}

export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => write('debug', m, c),
  info: (m: string, c?: Record<string, unknown>) => write('info', m, c),
  warn: (m: string, c?: Record<string, unknown>) => write('warn', m, c),
  error: (m: string, c?: Record<string, unknown>) => write('error', m, c),
};
