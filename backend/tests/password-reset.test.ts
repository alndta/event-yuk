import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { memoryDeps } from './support/memory';

const API = '/api/v1';

async function account(app: ReturnType<typeof createApp>, email: string) {
  const o = await request(app).post(`${API}/auth/send-otp`).send({ email });
  await request(app).post(`${API}/auth/verify-otp-register`).send({ full_name: 'Aku', email, password: 'LamaSekali1!', otp_code: o.body.otp_preview });
}

describe('password reset', () => {
  it('sets a new password with the emailed code, and the old one stops working', async () => {
    const { deps, sent } = memoryDeps();
    const app = createApp(deps);
    await account(app, 'a@x.id');
    const ask = await request(app).post(`${API}/auth/forgot-password`).send({ email: 'a@x.id' });
    expect(ask.status).toBe(200);
    expect(sent.at(-1)?.subject).toContain('atur ulang');
    const reset = await request(app).post(`${API}/auth/reset-password`).send({ email: 'a@x.id', otp_code: ask.body.otp_preview, new_password: 'BaruSekali2!' });
    expect(reset.status).toBe(200);
    expect((await request(app).post(`${API}/auth/login`).send({ email: 'a@x.id', password: 'LamaSekali1!' })).status).toBe(401);
    expect((await request(app).post(`${API}/auth/login`).send({ email: 'a@x.id', password: 'BaruSekali2!' })).status).toBe(200);
  });

  it('sends the email in the language the visitor uses', async () => {
    const { deps, sent } = memoryDeps();
    const app = createApp(deps);
    await account(app, 'b@x.id');
    await request(app).post(`${API}/auth/forgot-password`).set('Accept-Language', 'en').send({ email: 'b@x.id' });
    expect(sent.at(-1)?.subject).toBe('Your Event Yuk password reset code');
  });

  it('answers the same for unknown emails and sends nothing', async () => {
    const { deps, sent } = memoryDeps();
    const app = createApp(deps);
    const before = sent.length;
    const res = await request(app).post(`${API}/auth/forgot-password`).send({ email: 'nobody@x.id' });
    expect(res.status).toBe(200);
    expect(res.body.otp_preview).toBeUndefined();
    expect(sent.length).toBe(before);
  });

  it('rejects a wrong code, a registration code, and a weak password', async () => {
    const { deps } = memoryDeps();
    const app = createApp(deps);
    await account(app, 'c@x.id');
    const ask = await request(app).post(`${API}/auth/forgot-password`).send({ email: 'c@x.id' });
    expect((await request(app).post(`${API}/auth/reset-password`).send({ email: 'c@x.id', otp_code: '000000', new_password: 'BaruSekali2!' })).status).toBe(400);
    expect((await request(app).post(`${API}/auth/reset-password`).send({ email: 'c@x.id', otp_code: ask.body.otp_preview, new_password: 'pendek' })).status).toBe(400);
    // a code issued for sign-up must not reset a password
    const reg = await request(app).post(`${API}/auth/send-otp`).send({ email: 'c@x.id' });
    expect((await request(app).post(`${API}/auth/reset-password`).send({ email: 'c@x.id', otp_code: reg.body.otp_preview, new_password: 'BaruSekali2!' })).status).toBe(400);
  });
});
