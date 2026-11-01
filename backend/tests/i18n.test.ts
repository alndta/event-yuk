import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { EN, translate } from '../src/shared/i18n/messages';
import { memoryDeps } from './support/memory';

const src = path.resolve(__dirname, '../src');
const walk = (d: string): string[] =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.ts') ? [path.join(d, e.name)] : []));

describe('message translations', () => {
  it('every error and validation message in the code has an English version', () => {
    const missing: string[] = [];
    for (const file of walk(src)) {
      if (file.endsWith('messages.ts')) continue;
      const text = fs.readFileSync(file, 'utf8');
      const found = [
        ...text.matchAll(/\b(?:badRequest|conflict|notFound|forbidden|unauthorized|tooManyRequests|badGateway|serviceUnavailable)\('([^'$]+)'/g),
        ...(file.endsWith('schemas.ts') ? [...text.matchAll(/(?:,|message:)\s*'([A-Z][^']*\.)'/g)] : []),
        ...[...text.matchAll(/[lL]imiter\([^)'"]*,\s*'([^']+)'/g)],
      ].map((m) => m[1] as string);
      for (const msg of found) if (!(msg in EN) && translate(msg, 'en') === msg) missing.push(`${path.relative(src, file)}: ${msg}`);
    }
    expect(missing).toEqual([]);
  });

  it('rebuilds messages that carry values', () => {
    expect(translate('Fitur ini hanya untuk peran: EO, VENDOR.', 'en')).toBe('This feature is only for the roles: EO, VENDOR.');
    expect(translate('Pengajuan ini sudah berstatus REJECTED dan tidak bisa diubah lagi.', 'en')).toContain('REJECTED');
  });

  it('answers in the language the request asks for', async () => {
    const app = createApp(memoryDeps().deps);
    const id = await request(app).get('/api/v1/users/me');
    const en = await request(app).get('/api/v1/users/me').set('Accept-Language', 'en');
    expect(id.status).toBe(401);
    expect(id.body.error).toBe('Silakan masuk terlebih dahulu.');
    expect(en.body.error).toBe('Please sign in first.');
    const bad = await request(app).post('/api/v1/auth/login').set('Accept-Language', 'en-US').send({ email: 'x', password: '' });
    expect(bad.body.error).toBe('The data you sent is not valid.');
    expect(JSON.stringify(bad.body.details)).toMatch(/not valid|required/);
  });
});
