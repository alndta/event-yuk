import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { memoryDeps } from './support/memory';

async function register(app: ReturnType<typeof createApp>, email = 'a@x.id') {
  const otp = await request(app).post('/api/v1/auth/send-otp').send({ email });
  const code = otp.body.otp_preview ?? otp.body.data?.otp_preview;
  return request(app).post('/api/v1/auth/verify-otp-register').send({ full_name: 'Aku', email, password: 'Rahasia123!', otp_code: code });
}

describe('identity', () => {
  it('registers with a valid OTP and returns a token', async () => {
    const { deps } = memoryDeps();
    const res = await register(createApp(deps));
    expect(res.status).toBe(201);
    expect(JSON.stringify(res.body)).toContain('token');
  });

  it('rejects a wrong OTP', async () => {
    const { deps } = memoryDeps();
    const app = createApp(deps);
    await request(app).post('/api/v1/auth/send-otp').send({ email: 'b@x.id' });
    const res = await request(app).post('/api/v1/auth/verify-otp-register').send({ full_name: 'B', email: 'b@x.id', password: 'Rahasia123!', otp_code: '000000' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('refuses protected routes without a token and ignores spoofed headers', async () => {
    const { deps } = memoryDeps();
    const app = createApp(deps);
    expect((await request(app).get('/api/v1/users/me')).status).toBe(401);
    const spoof = await request(app).get('/api/v1/users/me').set('x-user-id', 'someone').set('x-user-role', 'EO');
    expect(spoof.status).toBe(401);
  });

  it('logs in with the right password only', async () => {
    const { deps } = memoryDeps();
    const app = createApp(deps);
    await register(app, 'c@x.id');
    expect((await request(app).post('/api/v1/auth/login').send({ email: 'c@x.id', password: 'Rahasia123!' })).status).toBe(200);
    expect((await request(app).post('/api/v1/auth/login').send({ email: 'c@x.id', password: 'salah' })).status).toBe(401);
  });

  it('does not let a user mark themselves verified', async () => {
    const { deps } = memoryDeps();
    const app = createApp(deps);
    const reg = await register(app, 'd@x.id');
    const token = JSON.stringify(reg.body).match(/"token":"([^"]+)"/)![1];
    const res = await request(app).patch('/api/v1/users/profile').set('Authorization', `Bearer ${token}`).send({ kyc_status: 'VERIFIED' });
    const me = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`);
    expect(JSON.stringify(me.body)).not.toContain('"VERIFIED"');
    expect(res.status).toBeLessThan(500);
  });
});
