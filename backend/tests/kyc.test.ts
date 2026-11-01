import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { memoryDeps } from './support/memory';

const API = '/api/v1';
const bank = { bank_code: 'BCA', account_number: '1234567890', account_holder: 'Aku' };

async function signUp(app: ReturnType<typeof createApp>, email: string) {
  const o = await request(app).post(`${API}/auth/send-otp`).send({ email });
  const code = o.body.otp_preview ?? o.body.data?.otp_preview;
  const r = await request(app).post(`${API}/auth/verify-otp-register`).send({ full_name: 'Aku', email, password: 'Rahasia123!', otp_code: code });
  const token = JSON.stringify(r.body).match(/"token":"([^"]+)"/)![1];
  await request(app).post(`${API}/users/roles/set-role`).set('Authorization', `Bearer ${token}`).send({ role_type: 'VENDOR', business_name: 'Toko', city_region: 'Jakarta' });
  return token;
}
const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('e-KYC', () => {
  it('goes pending, then only an admin can verify', async () => {
    const app = createApp(memoryDeps().deps);
    const user = await signUp(app, 'u@x.id');
    const admin = await signUp(app, 'admin@eventyuk.id');
    const nik = '3171234567890001';

    expect((await request(app).post(`${API}/users/kyc`).set(auth(user)).send({ nik, bank_account: bank })).status).toBe(200);
    expect((await request(app).get(`${API}/users/kyc`).set(auth(user))).body.kyc.status).toBe('PENDING');

    const me = await request(app).get(`${API}/users/me`).set(auth(user));
    const id = JSON.stringify(me.body).match(/"id":"([^"]+)"/)![1];

    expect((await request(app).post(`${API}/admin/users/${id}/kyc`).set(auth(user)).send({ decision: 'VERIFIED' })).status).toBe(403);
    expect((await request(app).post(`${API}/admin/users/${id}/kyc`).set(auth(admin)).send({ decision: 'VERIFIED' })).status).toBe(200);
    expect((await request(app).get(`${API}/users/kyc`).set(auth(user))).body.kyc.status).toBe('VERIFIED');
  });

  it('requires a reason to reject and allows resubmitting afterwards', async () => {
    const app = createApp(memoryDeps().deps);
    const user = await signUp(app, 'v@x.id');
    const admin = await signUp(app, 'admin@eventyuk.id');
    await request(app).post(`${API}/users/kyc`).set(auth(user)).send({ nik: '3171234567890002', bank_account: bank });
    const id = JSON.stringify((await request(app).get(`${API}/users/me`).set(auth(user))).body).match(/"id":"([^"]+)"/)![1];

    expect((await request(app).post(`${API}/admin/users/${id}/kyc`).set(auth(admin)).send({ decision: 'UNVERIFIED' })).status).toBe(400);
    await request(app).post(`${API}/admin/users/${id}/kyc`).set(auth(admin)).send({ decision: 'UNVERIFIED', reason: 'Foto KTP buram' });
    const st = (await request(app).get(`${API}/users/kyc`).set(auth(user))).body.kyc;
    expect(st.status).toBe('UNVERIFIED');
    expect(st.reject_reason).toBe('Foto KTP buram');
    expect((await request(app).post(`${API}/users/kyc`).set(auth(user)).send({ nik: '3171234567890002', bank_account: bank })).status).toBe(200);
  });

  it('refuses the same NIK on a second account and double submits', async () => {
    const app = createApp(memoryDeps().deps);
    const a = await signUp(app, 'a1@x.id');
    const b = await signUp(app, 'b1@x.id');
    const nik = '3171234567890003';
    expect((await request(app).post(`${API}/users/kyc`).set(auth(a)).send({ nik, bank_account: bank })).status).toBe(200);
    expect((await request(app).post(`${API}/users/kyc`).set(auth(a)).send({ nik, bank_account: bank })).status).toBe(409);
    expect((await request(app).post(`${API}/users/kyc`).set(auth(b)).send({ nik, bank_account: bank })).status).toBe(409);
  });
});
