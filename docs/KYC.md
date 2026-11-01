# Konsep KYC Event Yuk

Dokumen ini menjelaskan bagaimana verifikasi identitas (KYC) sebaiknya bekerja di Event Yuk: siapa yang wajib, kapan, datanya apa, siapa yang memutuskan, dan bagaimana datanya dijaga. Ini **usulan**, bukan sesuatu yang sudah berjalan penuh. Bagian "Yang sudah ada di kode" menjelaskan titik awalnya, dan bagian "Keputusan yang butuh jawabanmu" di akhir menandai hal-hal yang perlu diputuskan sebelum dibangun.

> Catatan penting: dokumen ini bukan nasihat hukum. Hal yang menyangkut data pribadi, escrow, dan izin usaha perlu dikonfirmasi ke konsultan hukum sebelum rilis.

---

## 1. Kenapa Event Yuk butuh KYC

Event Yuk menahan uang dua pihak (DP di escrow) dan mencairkannya setelah pekerjaan selesai. Tanpa tahu siapa penerima uangnya, tiga masalah muncul:

1. **Penipuan penerima.** Akun palsu menerima DP lalu hilang.
2. **Pencucian atau penyalahgunaan rekening.** Rekening orang lain dipakai untuk menarik dana.
3. **Sengketa tanpa pihak yang bisa dituntut.** Kontrak PKS digital hanya berarti kalau pihaknya jelas.

KYC menjawab satu pertanyaan: **"Apakah orang atau badan di balik akun ini benar, dan apakah rekening penarikannya miliknya?"**

KYC bukan syarat untuk melihat-lihat, membuat akun, atau bernegosiasi. Ia menjadi syarat **di titik uang berpindah**.

## 2. Yang sudah ada di kode

| Hal | Kondisi sekarang |
|---|---|
| Status | `users.kyc_status` bernilai `UNVERIFIED`, `PENDING`, atau `VERIFIED` |
| Pengajuan | `POST /api/v1/users/kyc` menerima NIK (16 angka) dan rekening bank, lalu mengubah status ke `PENDING`. Akun **tidak bisa memverifikasi dirinya sendiri** |
| Keputusan | `POST /api/v1/admin/users/:id/kyc` dengan `VERIFIED` atau `UNVERIFIED`, hanya untuk email yang ada di `ADMIN_EMAILS` |
| NIK | Divalidasi formatnya, **tidak disimpan** (belum ada kebijakan enkripsi dan retensi) |
| Foto KTP/NPWP | Antarmuka punya kotak unggah, tetapi **belum ada penyimpanan sungguhan** |
| Rekening | Disimpan di `user_profiles_roles.bank_account` (JSON) |
| Penggunaan status | Ditampilkan sebagai lencana "terverifikasi" di direktori dan detail acara |

Artinya: alur status dan keputusan admin sudah benar, tetapi **belum ada bukti yang bisa diperiksa admin**. Admin saat ini memutuskan tanpa melihat dokumen. Itu celah yang harus ditutup sebelum label "terverifikasi" boleh dipercaya.

## 3. Siapa wajib KYC, dan kapan

Prinsipnya: **semakin dekat ke uang, semakin ketat.**

| Peran | Menerima uang? | Perlu KYC sebelum... |
|---|---|---|
| Vendor | Ya (DP dan pelunasan) | menerima kontrak didanai, dan menarik saldo |
| Band / musisi | Ya (honor) | menerima kontrak didanai, dan menarik saldo |
| EO | Ya, kalau menerima uang sponsor atau sewa booth | menerima dana dari sponsor atau tenant, dan menarik saldo |
| Tenant | Tidak (membayar sewa) | membayar sewa booth (identitas minimal) |
| Sponsor | Tidak (membayar) | membayar paket sponsorship (identitas badan usaha) |
| Kru | Ya (honor shift) | menarik honor |

### Tingkatan (usulan)

| Tingkat | Syarat | Yang dibuka |
|---|---|---|
| **0, Terdaftar** | Email terverifikasi OTP | Jelajah, negosiasi, kirim pengajuan |
| **1, Terverifikasi** | KYC disetujui, rekening cocok atas nama | Kontrak boleh didanai, tarik saldo sampai batas |
| **2, Terverifikasi penuh** (opsional, tahap lanjut) | Dokumen badan usaha (NPWP/NIB/akta) untuk vendor, EO, dan sponsor | Batas transaksi lebih tinggi |

Tingkat 2 bisa ditunda. Mulai dari 0 dan 1 saja.

## 4. Data yang dikumpulkan

**Individu (kru, musisi perorangan, vendor perorangan):**

- Nama lengkap sesuai KTP
- NIK (16 angka)
- Foto KTP
- Foto swafoto (selfie) memegang KTP, atau swafoto biasa untuk pencocokan wajah
- Rekening bank atas nama yang sama dengan KTP

**Badan usaha (EO, vendor, sponsor, tenant berbadan usaha):**

- Nama badan usaha dan jenisnya (PT, CV, perorangan)
- NPWP badan
- NIB atau izin usaha yang relevan
- KTP penanggung jawab dan swafotonya
- Rekening bank atas nama badan usaha

Prinsip pengumpulan: **minta secukupnya.** Jangan meminta dokumen yang tidak dipakai untuk keputusan.

## 5. Alur

```
Terdaftar (UNVERIFIED)
   │  kirim data + dokumen
   ▼
Menunggu (PENDING) ──── cek otomatis (format, duplikat, kecocokan nama rekening)
   │                         │ gagal jelas → DITOLAK dengan alasan
   ▼
Ditinjau admin ──── setuju ──▶ TERVERIFIKASI (VERIFIED)
   │
   └─ tolak ──▶ DITOLAK (alasan tertulis) ──▶ bisa kirim ulang
```

Aturan alur:

1. Pengguna tidak pernah mengubah statusnya sendiri.
2. Selama `PENDING`, data tidak bisa diubah (supaya yang ditinjau sama dengan yang disetujui).
3. Penolakan **wajib memuat alasan** dalam bahasa yang bisa ditindaklanjuti ("foto KTP buram", "nama rekening tidak sama dengan KTP").
4. Setiap keputusan dicatat: siapa, kapan, apa, dan alasannya.
5. Mengubah rekening penarikan **setelah terverifikasi** mengembalikan status ke `PENDING` untuk rekening itu. Ini mencegah pencurian payout lewat penggantian rekening.
6. Pengajuan ulang dibatasi (misalnya 5 kali per 24 jam) supaya tidak dipakai untuk menebak.

## 6. Pemeriksaan otomatis

Sebelum masuk antrean admin:

- **Format NIK** (16 angka, kode wilayah masuk akal, tanggal lahir valid).
- **Duplikat**: satu NIK tidak boleh dipakai dua akun. Bandingkan lewat *hash* NIK, bukan NIK mentah.
- **Nama rekening sama dengan nama KTP.** Ini pemeriksaan paling berharga melawan penipuan penarikan. Cara paling andal adalah validasi rekening lewat penyedia (cek nama pemilik rekening), bukan sekadar membandingkan teks yang diketik pengguna.
- **Kualitas gambar** (tidak buram, tidak terpotong).

Pemeriksaan lanjutan lewat penyedia pihak ketiga (opsional, tahap lanjut):

- Pencocokan NIK dan nama ke data kependudukan
- Pencocokan wajah (swafoto dengan foto KTP) dan deteksi kehidupan (*liveness*)

Menggunakan penyedia (misalnya penyedia e-KYC berlisensi di Indonesia) mengurangi beban tinjauan manual dan risiko dokumen palsu, dengan biaya per verifikasi. Memilih penyedia adalah keputusan bisnis, lihat bagian 11.

## 7. Model data (usulan)

Status di `users.kyc_status` tetap menjadi sumber kebenaran untuk "boleh atau tidak". Detail bukti dipisah ke tabel sendiri supaya akses dan retensinya bisa diatur ketat.

```sql
-- Satu baris per pengajuan; riwayat tidak ditimpa.
create table kyc_submissions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  subject_type  text not null check (subject_type in ('INDIVIDUAL','BUSINESS')),
  legal_name    text not null,
  nik_hash      text,              -- HMAC dari NIK, untuk deteksi duplikat
  nik_encrypted bytea,             -- hanya bila NIK memang perlu disimpan (lihat keputusan)
  status        text not null default 'PENDING'
                check (status in ('PENDING','APPROVED','REJECTED')),
  reject_reason text,
  reviewed_by   uuid references users(id),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- Dokumen disimpan di Storage privat; tabel ini hanya menyimpan rujukannya.
create table kyc_documents (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references kyc_submissions(id) on delete cascade,
  kind          text not null check (kind in ('KTP','SELFIE','NPWP','NIB','AKTA')),
  storage_path  text not null,
  created_at    timestamptz not null default now()
);

-- Jejak audit: tidak boleh diubah atau dihapus oleh aplikasi.
create table kyc_audit_log (
  id          bigint generated always as identity primary key,
  submission_id uuid not null,
  actor_id    uuid,
  action      text not null,       -- SUBMITTED, VIEWED_DOCUMENT, APPROVED, REJECTED
  note        text,
  at          timestamptz not null default now()
);
```

Catatan: tabel-tabel ini wajib memakai **Row Level Security** yang menolak semua akses langsung dari klien. Hanya backend (service role) yang boleh menyentuhnya.

## 8. Penyimpanan dokumen

- Simpan di **bucket privat** Supabase Storage. Tidak ada URL publik.
- Admin melihat dokumen lewat **tautan bertanda tangan berumur pendek** (misalnya 5 menit), dan setiap pembukaan dicatat di `kyc_audit_log` (`VIEWED_DOCUMENT`).
- Batasi jenis file (JPG, PNG, PDF) dan ukuran (misalnya 5 MB), periksa tipe file dari isinya, bukan dari ekstensi.
- Nama file di penyimpanan diacak (UUID), tidak memuat nama atau NIK.
- Pengunggahan dilakukan lewat backend atau tautan unggah bertanda tangan, bukan langsung ke bucket dengan kunci publik.

## 9. Perlindungan data pribadi

NIK dan foto KTP adalah **data pribadi yang sensitif**. Hal yang perlu dipastikan sebelum mengumpulkannya:

1. **Dasar hukum dan persetujuan.** Indonesia punya UU Pelindungan Data Pribadi (UU No. 27 Tahun 2022). Pengguna harus tahu data apa yang dikumpulkan, untuk apa, dan berapa lama. Teks persetujuan perlu ditinjau konsultan hukum.
2. **Minimisasi.** Kumpulkan hanya yang dipakai untuk keputusan.
3. **Enkripsi.** NIK, kalau disimpan, dienkripsi di level aplikasi (bukan hanya enkripsi disk database). Untuk deteksi duplikat cukup simpan HMAC-nya.
4. **Retensi.** Tentukan berapa lama dokumen disimpan setelah disetujui atau ditolak, lalu hapus otomatis. Usulan awal: dokumen ditolak dihapus setelah 30 hari, dokumen disetujui disimpan selama hubungan akun berjalan ditambah masa yang disyaratkan hukum.
5. **Hak pengguna.** Sediakan cara meminta penghapusan atau pengunduhan data.
6. **Akses admin terbatas.** Hanya sedikit orang yang boleh melihat dokumen. Peran admin KYC sebaiknya dipisah dari admin umum.
7. **Insiden.** Siapkan prosedur kalau data bocor (siapa dihubungi, dalam berapa lama).
8. **Log tidak boleh memuat data pribadi.** Logger backend sudah menyamarkan field berbahaya, dan itu harus tetap berlaku untuk modul KYC.

## 10. Aturan yang menggunakan status KYC

Ini bagian yang membuat KYC bermakna. Tanpa penegakan di backend, KYC hanya hiasan.

| Aksi | Syarat |
|---|---|
| Membuat pembayaran DP (`/payments/proposals/:id/checkout`) | Pihak **penerima** kontrak berstatus `VERIFIED` (jangan menahan uang untuk akun yang tidak bisa dicairkan) |
| Pencairan dana ke rekening | Penerima `VERIFIED`, rekening sama dengan rekening yang diverifikasi |
| Mengubah rekening | Kembali ke tinjauan |
| Lencana "terverifikasi" di direktori | Hanya untuk `VERIFIED` (sudah begitu di kode) |
| Batas nominal | Tingkat 1: ada batas per transaksi dan per bulan; tingkat 2: lebih tinggi |

Penegakan dilakukan di **service backend**, bukan di antarmuka. Antarmuka hanya menjelaskan kenapa tombol tidak aktif.

## 11. Keputusan yang butuh jawabanmu

| # | Pertanyaan | Pilihan | Usulan awal |
|---|---|---|---|
| 1 | Apakah KYC dikerjakan manual atau lewat penyedia? | (a) manual oleh admin, (b) penyedia e-KYC, (c) manual dulu, penyedia nanti | **(c)** supaya cepat jalan dan biaya terkendali |
| 2 | Apakah NIK disimpan? | (a) tidak, hanya hash, (b) ya, terenkripsi | **(a)**; simpan hash untuk duplikat dan foto KTP sebagai bukti |
| 3 | Berapa lama dokumen disimpan? | angka hari | Ditolak 30 hari; disetujui selama akun aktif (konfirmasi ke konsultan hukum) |
| 4 | Siapa admin KYC? | orang dan jumlahnya | 1 sampai 3 orang, peran terpisah dari admin umum |
| 5 | Apakah tenant dan sponsor wajib KYC penuh? | ya atau minimal | **Minimal** (identitas dan rekening), karena mereka membayar, bukan menerima |
| 6 | Batas nominal per tingkat | angka rupiah | Perlu masukan bisnis dan penyedia pembayaran |
| 7 | Apakah badan usaha wajib dokumen legal di tahap awal? | ya atau nanti | **Nanti** (tahap 2) |
| 8 | Klaim di situs | lihat di bawah | Selaraskan dengan kenyataan |

### Klaim di situs yang harus bisa dibuktikan

Antarmuka dan footer saat ini menyebut hal seperti "Escrow Midtrans Berizin BI", "e-KYC dan PKS Digital", dan "Mitra Terverifikasi e-KYC". Sebelum rilis:

- Label **"Terverifikasi e-KYC"** hanya muncul untuk akun `VERIFIED` (backend baru sudah begitu).
- Pernyataan tentang **izin atau lisensi** (misalnya "berizin Bank Indonesia") hanya boleh dipakai kalau memang ada dasar tertulis yang bisa ditunjukkan. Itu klaim yang bisa berujung masalah hukum kalau keliru, jadi perlu dipastikan dengan pihak yang berwenang.
- Verifikasi merchant di Midtrans (KYC Event Yuk sebagai penjual) **berbeda** dari KYC pengguna di dokumen ini.

## 12. Rencana bertahap

| Tahap | Isi | Hasil |
|---|---|---|
| **A** | Tabel `kyc_*`, unggah dokumen ke bucket privat, halaman tinjauan admin, alasan penolakan, jejak audit | Admin bisa melihat bukti sebelum memutuskan |
| **B** | Penegakan: DP dan pencairan hanya untuk penerima `VERIFIED`, rekening ikut diverifikasi | KYC benar-benar melindungi uang |
| **C** | Pemeriksaan otomatis (duplikat NIK, nama rekening, kualitas gambar) | Antrean admin lebih ringan |
| **D** | Penyedia e-KYC (pencocokan data kependudukan, wajah, liveness) dan tingkat 2 badan usaha | Skala dan keamanan lebih tinggi |

Tahap A dan B adalah syarat minimum sebelum Event Yuk menahan uang pengguna sungguhan.

## 13. Kriteria selesai untuk tahap A dan B

- [ ] Admin bisa membuka KTP dan swafoto lewat tautan sementara, dan pembukaannya tercatat.
- [ ] Penolakan tanpa alasan ditolak oleh sistem.
- [ ] Pengguna tidak bisa mengubah `kyc_status` dengan cara apa pun.
- [ ] Mengubah rekening setelah verifikasi membuat status kembali menunggu.
- [ ] `checkout` DP gagal dengan pesan jelas bila penerima belum `VERIFIED`.
- [ ] Tabel `kyc_*` tidak bisa dibaca dengan kunci anon (diuji).
- [ ] Dokumen ditolak terhapus otomatis sesuai kebijakan retensi.
- [ ] Teks persetujuan data pribadi sudah ditinjau konsultan hukum.
