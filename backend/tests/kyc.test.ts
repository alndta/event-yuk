import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { memoryDeps } from './support/memory';

const API = '/api/v1';
// Smallest bytes that pass the image check: a JPEG signature and a PNG signature.
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);

async function uploadBoth(app: ReturnType<typeof createApp>, token: string) {
  const put = (kind: string, type: string, body: Buffer) =>
    request(app).post(`${API}/users/kyc/documents?kind=${kind}`).set({ Authorization: `Bearer ${token}`, 'Content-Type': type }).send(body);
  await put('KTP', 'image/jpeg', JPEG);
  await put('SELFIE', 'image/png', PNG);
}

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

    await uploadBoth(app, user);
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
    await uploadBoth(app, user);
    await request(app).post(`${API}/users/kyc`).set(auth(user)).send({ nik: '3171234567890002', bank_account: bank });
    const id = JSON.stringify((await request(app).get(`${API}/users/me`).set(auth(user))).body).match(/"id":"([^"]+)"/)![1];

    expect((await request(app).post(`${API}/admin/users/${id}/kyc`).set(auth(admin)).send({ decision: 'UNVERIFIED' })).status).toBe(400);
    await request(app).post(`${API}/admin/users/${id}/kyc`).set(auth(admin)).send({ decision: 'UNVERIFIED', reason: 'Foto KTP buram' });
    const st = (await request(app).get(`${API}/users/kyc`).set(auth(user))).body.kyc;
    expect(st.status).toBe('UNVERIFIED');
    expect(st.reject_reason).toBe('Foto KTP buram');
    await uploadBoth(app, user);
    expect((await request(app).post(`${API}/users/kyc`).set(auth(user)).send({ nik: '3171234567890002', bank_account: bank })).status).toBe(200);
  });

  it('refuses the same NIK on a second account and double submits', async () => {
    const app = createApp(memoryDeps().deps);
    const a = await signUp(app, 'a1@x.id');
    const b = await signUp(app, 'b1@x.id');
    const nik = '3171234567890003';
    await uploadBoth(app, a);
    await uploadBoth(app, b);
    expect((await request(app).post(`${API}/users/kyc`).set(auth(a)).send({ nik, bank_account: bank })).status).toBe(200);
    expect((await request(app).post(`${API}/users/kyc`).set(auth(a)).send({ nik, bank_account: bank })).status).toBe(409);
    expect((await request(app).post(`${API}/users/kyc`).set(auth(b)).send({ nik, bank_account: bank })).status).toBe(409);
  });

  it('needs both photos before a submission is accepted', async () => {
    const app = createApp(memoryDeps().deps);
    const user = await signUp(app, 'p1@x.id');
    const res = await request(app).post(`${API}/users/kyc`).set(auth(user)).send({ nik: '3171234567890004', bank_account: bank });
    expect(res.status).toBe(400);
  });

  it('accepts only real JPG or PNG files, judged by their bytes', async () => {
    const app = createApp(memoryDeps().deps);
    const user = await signUp(app, 'p2@x.id');
    const send = (type: string, body: Buffer) =>
      request(app).post(`${API}/users/kyc/documents?kind=KTP`).set({ Authorization: `Bearer ${user}`, 'Content-Type': type }).send(body);
    expect((await send('image/jpeg', Buffer.from('<?php echo 1; ?>'))).status).toBe(400); // text posing as a JPEG
    expect((await send('image/jpeg', JPEG)).status).toBe(201);
    expect((await send('application/pdf', Buffer.from('%PDF-1.4'))).status).toBeGreaterThanOrEqual(400);
    expect((await request(app).post(`${API}/users/kyc/documents?kind=KTP`).set({ 'Content-Type': 'image/jpeg' }).send(JPEG)).status).toBe(401);
  });

  it('lets only an admin see the photos, and reports what has been uploaded', async () => {
    const app = createApp(memoryDeps().deps);
    const user = await signUp(app, 'p3@x.id');
    const admin = await signUp(app, 'admin@eventyuk.id');
    await uploadBoth(app, user);
    expect((await request(app).get(`${API}/users/kyc`).set(auth(user))).body.kyc.documents).toEqual({ ktp: true, selfie: true });
    const id = JSON.stringify((await request(app).get(`${API}/users/me`).set(auth(user))).body).match(/"id":"([^"]+)"/)![1];
    expect((await request(app).get(`${API}/admin/kyc/${id}/documents`).set(auth(user))).status).toBe(403);
    const res = await request(app).get(`${API}/admin/kyc/${id}/documents`).set(auth(admin));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].url).toContain('https://files.test/');
  });

  it('marks admin accounts in the session view', async () => {
    const app = createApp(memoryDeps().deps);
    const admin = await signUp(app, 'admin@eventyuk.id');
    const user = await signUp(app, 'q1@x.id');
    expect((await request(app).get(`${API}/users/me`).set(auth(admin))).body.user.is_admin).toBe(true);
    expect((await request(app).get(`${API}/users/me`).set(auth(user))).body.user.is_admin).toBe(false);
  });

  it('deletes photos right away when a submission is rejected', async () => {
    const { deps, documents } = memoryDeps();
    const app = createApp(deps);
    const user = await signUp(app, 'r1@x.id');
    const admin = await signUp(app, 'admin@eventyuk.id');
    await uploadBoth(app, user);
    expect(documents.files.size).toBe(2);
    await request(app).post(`${API}/users/kyc`).set(auth(user)).send({ nik: '3171234567890010', bank_account: bank });
    const id = JSON.stringify((await request(app).get(`${API}/users/me`).set(auth(user))).body).match(/"id":"([^"]+)"/)![1];
    await request(app).post(`${API}/admin/users/${id}/kyc`).set(auth(admin)).send({ decision: 'UNVERIFIED', reason: 'Foto buram' });
    expect(documents.files.size).toBe(0);
    expect((await request(app).get(`${API}/users/kyc`).set(auth(user))).body.kyc.documents).toEqual({ ktp: false, selfie: false });
  });

  it('keeps approved photos for the retention period, then deletes them', async () => {
    const { deps, documents } = memoryDeps();
    const app = createApp(deps);
    const user = await signUp(app, 'r2@x.id');
    const admin = await signUp(app, 'admin@eventyuk.id');
    await uploadBoth(app, user);
    await request(app).post(`${API}/users/kyc`).set(auth(user)).send({ nik: '3171234567890011', bank_account: bank });
    const id = JSON.stringify((await request(app).get(`${API}/users/me`).set(auth(user))).body).match(/"id":"([^"]+)"/)![1];
    await request(app).post(`${API}/admin/users/${id}/kyc`).set(auth(admin)).send({ decision: 'VERIFIED' });
    expect(documents.files.size).toBe(2); // still within the window
    const jobs = app.locals.jobs as { purgeKycPhotos: (now?: Date) => Promise<number> };
    expect(await jobs.purgeKycPhotos()).toBe(0); // not due yet
    expect(documents.files.size).toBe(2);
    const later = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
    expect(await jobs.purgeKycPhotos(later)).toBe(2);
    expect(documents.files.size).toBe(0);
  });
});
