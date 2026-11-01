# Event Yuk API (modular monolith)

```
src/
  shared/     kernel: config, errors, auth guards, crypto, db client, event bus
  modules/
    identity/   akun, OTP, login, peran, KYC
    events/     acara, booth, shift
    proposals/  negosiasi + state machine
    payments/   escrow, Midtrans, dompet
    catalog/    direktori mitra, paket vendor, penampilan
  app.ts      merakit modul (satu-satunya tempat modul saling disambung)
  main.ts     titik masuk server
```

Tiap modul: `ports` (antarmuka repo) → `service` → `routes` → `infra` (Supabase) → `index.ts` (API publik).
Modul hanya boleh mengimpor modul lain lewat `index.ts` (dijaga `tests/architecture.test.ts`).

```bash
npm run dev     # tsx watch
npm test        # vitest
npm run build && npm start
```

Jalankan `supabase/migrations/20261101000000_modulith_hardening.sql` di database sebelum production.
Docs API: `/api-docs` (non-production) dan `/api-docs.json`.

## e-KYC dan penyimpanan foto

Foto KTP dan selfie disimpan di bucket Supabase Storage `kyc-documents` yang **privat** (dibuat oleh migrasi).
Tidak ada tautan publik; admin hanya mendapat tautan bertanda tangan yang berlaku 2 menit, dan setiap pembukaan dicatat di log.
Akun admin adalah email yang ada di `ADMIN_EMAILS`.

Foto yang ditolak dihapus saat itu juga. Foto yang disetujui dihapus otomatis setelah `KYC_APPROVED_PHOTO_DAYS` hari (bawaan 30).
Yang tetap tersimpan hanya hash NIK, keputusan, pemeriksa, dan waktunya.

## Pesan error dua bahasa

Pesan error ditulis dalam bahasa Indonesia di kode, dan `src/shared/i18n/messages.ts` berisi versi Inggrisnya.
Bahasa dipilih per permintaan lewat header `Accept-Language` (web app mengirimnya dari pilihan bahasa pengguna).
Tes `tests/i18n.test.ts` gagal kalau ada pesan baru tanpa terjemahan.
