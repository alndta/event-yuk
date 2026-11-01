import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto';

const KEY_LENGTH = 64;
const PARAMS = { N: 16384, r: 8, p: 1 } as const;
const LEGACY_PREFIX = 'hash_';

function scrypt(password: string, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

/** scrypt$N$r$p$salt$hash, all base64. Self-describing so the cost can be raised later. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, PARAMS);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64'), key.toString('base64')].join('$');
}

export interface PasswordCheck {
  ok: boolean;
  /** True when the stored value is in an old format and should be replaced after a successful login. */
  needsRehash: boolean;
}

/** Equal-length digests so a comparison never leaks the length of the stored value. */
function constantTimeEqual(a: string, b: string): boolean {
  const da = createHash('sha256').update(a).digest();
  const db = createHash('sha256').update(b).digest();
  return timingSafeEqual(da, db);
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<PasswordCheck> {
  if (!stored) return { ok: false, needsRehash: false };

  // Accounts created before this module stored "hash_" + the plain password. They can still sign in once,
  // then they are upgraded in place.
  if (stored.startsWith(LEGACY_PREFIX)) {
    return { ok: constantTimeEqual(stored.slice(LEGACY_PREFIX.length), password), needsRehash: true };
  }

  const [scheme, n, r, p, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return { ok: false, needsRehash: false };
  const expected = Buffer.from(hash, 'base64');
  const key = await scrypt(password, Buffer.from(salt, 'base64'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  const ok = key.length === expected.length && timingSafeEqual(key, expected);
  return { ok, needsRehash: ok && (Number(n) !== PARAMS.N || Number(r) !== PARAMS.r || Number(p) !== PARAMS.p) };
}

let dummy: Promise<string> | undefined;
/** Burn the same time for an unknown email as for a known one, so response time does not reveal accounts. */
export async function verifyAgainstDummy(password: string): Promise<void> {
  dummy ??= hashPassword('tidak-dipakai-siapa-pun');
  await verifyPassword(password, await dummy);
}
