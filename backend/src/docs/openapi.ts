import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import type { Env } from '../shared/config/env';

const bearer = [{ bearerAuth: [] }];
const json = (schema: object) => ({ 'application/json': { schema } });
const ok = (description = 'Berhasil') => ({ 200: { description } });
const body = (props: Record<string, object>, required: string[] = []) => ({
  required: true,
  content: json({ type: 'object', required, properties: props }),
});
const str = { type: 'string' };
const num = { type: 'number' };
const uuid = { type: 'string', format: 'uuid' };
const idParam = { name: 'id', in: 'path', required: true, schema: uuid };

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Event Yuk API',
    version: '2.0.0',
    description:
      'API untuk ekosistem Event Yuk. Semua endpoint selain yang bertanda publik membutuhkan header `Authorization: Bearer <token>` dari login. Identitas selalu diambil dari token, bukan dari header lain.',
  },
  servers: [{ url: '/api/v1' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  tags: ['Identity', 'Events', 'Proposals', 'Catalog', 'Payments'].map((name) => ({ name })),
  paths: {
    '/auth/send-otp': { post: { tags: ['Identity'], summary: 'Kirim kode verifikasi ke email (publik)', requestBody: body({ email: str }, ['email']), responses: ok() } },
    '/auth/verify-otp-register': {
      post: {
        tags: ['Identity'],
        summary: 'Daftar dengan kode OTP (publik)',
        requestBody: body({ full_name: str, email: str, password: str, otp_code: str, initial_role: str, phone_wa: str }, ['full_name', 'email', 'password', 'otp_code']),
        responses: { 201: { description: 'Akun dibuat, mengembalikan token sesi' } },
      },
    },
    '/auth/login': { post: { tags: ['Identity'], summary: 'Masuk dengan email dan kata sandi (publik)', requestBody: body({ email: str, password: str }, ['email', 'password']), responses: ok('Token sesi') } },
    '/auth/google-sync': { post: { tags: ['Identity'], summary: 'Masuk dengan Google; token diverifikasi ke Supabase (publik)', requestBody: body({ access_token: str }, ['access_token']), responses: ok('Token sesi') } },
    '/users/me': { get: { tags: ['Identity'], summary: 'Profil akun sendiri', security: bearer, responses: ok() } },
    '/users/profile': { patch: { tags: ['Identity'], summary: 'Ubah profil dan rekening bank', security: bearer, requestBody: body({ full_name: str, phone_wa: str, business_name: str, city_region: str, bank_account: { type: 'object' } }), responses: ok() } },
    '/users/kyc': { post: { tags: ['Identity'], summary: 'Ajukan e-KYC (status menjadi PENDING)', security: bearer, requestBody: body({ nik: str, bank_account: { type: 'object' } }, ['nik', 'bank_account']), responses: ok() } },
    '/users/roles/set-role': { post: { tags: ['Identity'], summary: 'Pilih peran tetap akun (sekali saja)', security: bearer, requestBody: body({ role_type: str, business_name: str, city_region: str }, ['role_type']), responses: { 201: { description: 'Peran aktif' } } } },
    '/admin/users/{id}/kyc': { post: { tags: ['Identity'], summary: 'Putuskan e-KYC (hanya admin)', security: bearer, parameters: [idParam], requestBody: body({ decision: { type: 'string', enum: ['VERIFIED', 'UNVERIFIED'] } }, ['decision']), responses: ok() } },
    '/events': {
      get: { tags: ['Events'], summary: 'Daftar acara (publik)', parameters: [{ name: 'type', in: 'query', schema: { type: 'string', enum: ['live', 'portfolio'] } }, { name: 'category', in: 'query', schema: str }, { name: 'q', in: 'query', description: 'Cari di judul, venue, dan penyelenggara', schema: str }, { name: 'city', in: 'query', schema: str }], responses: ok() },
      post: { tags: ['Events'], summary: 'Buat acara (peran EO)', security: bearer, requestBody: body({ title: str, event_category: str, venue_name: str, start_date: str, end_date: str, total_budget: num }, ['title', 'event_category', 'venue_name', 'start_date', 'end_date']), responses: { 201: { description: 'Acara dibuat' } } },
    },
    '/events/portfolio': { post: { tags: ['Events'], summary: 'Unggah portofolio acara (peran EO)', security: bearer, requestBody: body({ title: str, event_category: str, venue_name: str, start_date: str }, ['title', 'event_category', 'venue_name', 'start_date']), responses: { 201: { description: 'Portofolio dibuat' } } } },
    '/events/{id}': { get: { tags: ['Events'], summary: 'Detail acara (publik)', parameters: [idParam], responses: ok() } },
    '/events/{id}/booths/{boothId}/register': { post: { tags: ['Events'], summary: 'Daftar sewa booth (peran TENANT)', security: bearer, parameters: [idParam, { name: 'boothId', in: 'path', required: true, schema: uuid }], requestBody: body({ brand_name: str }, ['brand_name']), responses: { 201: { description: 'Terdaftar' } } } },
    '/events/{id}/shifts/{shiftId}/apply': { post: { tags: ['Events'], summary: 'Lamar shift (peran CREW)', security: bearer, parameters: [idParam, { name: 'shiftId', in: 'path', required: true, schema: uuid }], responses: { 201: { description: 'Terkirim' } } } },
    '/proposals': {
      get: { tags: ['Proposals'], summary: 'Pengajuan milik pengguna (sebagai pengirim atau penerima)', security: bearer, responses: ok() },
      post: { tags: ['Proposals'], summary: 'Kirim pengajuan', security: bearer, requestBody: body({ event_id: uuid, receiver_id: uuid, proposal_type: str, direction: str, title: str, offered_price: num, dp_percentage: num }, ['event_id', 'receiver_id', 'proposal_type', 'direction', 'title', 'offered_price']), responses: { 201: { description: 'Terkirim' } } },
    },
    '/proposals/{id}/counter': { post: { tags: ['Proposals'], summary: 'Ajukan penawaran balik (hanya pihak yang gilirannya)', security: bearer, parameters: [idParam], requestBody: body({ counter_price: num, counter_dp_percentage: num, counter_notes: str }, ['counter_price']), responses: ok() } },
    '/proposals/{id}/respond': { post: { tags: ['Proposals'], summary: 'Setujui atau tolak', security: bearer, parameters: [idParam], requestBody: body({ action: { type: 'string', enum: ['ACCEPT', 'REJECT'] } }, ['action']), responses: ok() } },
    '/partners': { get: { tags: ['Catalog'], summary: 'Direktori mitra (publik)', parameters: [{ name: 'type', in: 'query', schema: str }, { name: 'q', in: 'query', description: 'Cari nama, kota, kategori, dan spesifikasi', schema: str }, { name: 'city', in: 'query', schema: str }], responses: ok() } },
    '/partners/{id}': { get: { tags: ['Catalog'], summary: 'Detail mitra (publik; kontak hanya untuk yang masuk)', parameters: [idParam], responses: ok() } },
    '/catalog/my-catalog': { get: { tags: ['Catalog'], summary: 'Katalog atau aktivitas milik sendiri', security: bearer, responses: ok() } },
    '/catalog/item': { post: { tags: ['Catalog'], summary: 'Tambah paket (VENDOR) atau katalog penampilan (TALENT)', security: bearer, responses: { 201: { description: 'Tersimpan' } } } },
    '/catalog/item/{id}': { delete: { tags: ['Catalog'], summary: 'Hapus paket milik sendiri', security: bearer, parameters: [idParam], responses: ok() } },
    '/payments/wallet': { get: { tags: ['Payments'], summary: 'Dompet sendiri', security: bearer, responses: ok() } },
    '/payments/proposals/{id}/checkout': { post: { tags: ['Payments'], summary: 'Mulai pembayaran DP lewat Midtrans (pihak pembayar saja)', security: bearer, parameters: [idParam], responses: { 201: { description: 'Berisi redirect_url Midtrans' } } } },
    '/payments/midtrans/notification': { post: { tags: ['Payments'], summary: 'Webhook Midtrans (diamankan signature, bukan sesi)', requestBody: body({ order_id: str, status_code: str, gross_amount: str, signature_key: str }, ['order_id', 'status_code', 'gross_amount', 'signature_key']), responses: ok() } },
  },
};

export function mountApiDocs(app: Express, env: Env) {
  app.get('/api-docs.json', (_req, res) => res.json(openApiSpec));
  // Interactive docs are convenient in development; in production the JSON is enough.
  if (!env.isProduction) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: 'Event Yuk API' }));
    app.get('/docs', (_req, res) => res.redirect('/api-docs'));
  }
}
