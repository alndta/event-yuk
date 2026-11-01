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
