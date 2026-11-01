import type { Request } from 'express';

export type Lang = 'id' | 'en';

/**
 * Error and validation messages are written in Indonesian where they are thrown. This table gives each one an
 * English version, chosen per request from the Accept-Language header the web app sends with the user's language.
 * A test fails if a message exists in the code without an entry here, so the two cannot drift apart.
 */
export const EN: Record<string, string> = {
  // generic
  'Silakan masuk terlebih dahulu.': 'Please sign in first.',
  'Kamu tidak punya akses ke sumber daya ini.': 'You do not have access to this resource.',
  'Data tidak ditemukan.': 'Not found.',
  'Data yang dikirim belum valid.': 'The data you sent is not valid.',
  'Isi permintaan bukan JSON yang valid.': 'The request body is not valid JSON.',
  'Isi permintaan terlalu besar.': 'The request is too large.',
  'Terjadi kesalahan pada server.': 'Something went wrong on the server.',
  'Terjadi kesalahan pada penyimpanan data.': 'Something went wrong while saving data.',
  'Endpoint tidak ditemukan.': 'Endpoint not found.',
  'Sesi tidak valid atau sudah berakhir. Silakan masuk lagi.': 'Your session is invalid or has expired. Please sign in again.',
  'Terlalu banyak permintaan. Coba lagi beberapa menit lagi.': 'Too many requests. Try again in a few minutes.',
  'Terlalu banyak percobaan masuk. Tunggu 15 menit lalu coba lagi.': 'Too many sign-in attempts. Wait 15 minutes and try again.',
  'Terlalu sering meminta kode. Tunggu beberapa menit.': 'You requested codes too often. Wait a few minutes.',
  'Terlalu banyak percobaan masuk untuk email ini. Tunggu 15 menit.': 'Too many sign-in attempts for this email. Wait 15 minutes.',
  // identity
  'Terlalu sering meminta kode. Tunggu beberapa menit lalu coba lagi.': 'You requested codes too often. Wait a few minutes and try again.',
  'Email belum bisa dikirim. Coba lagi sebentar lagi.': 'The email could not be sent. Please try again shortly.',
  'Kode OTP tidak valid atau sudah kedaluwarsa. Minta kode baru.': 'The code is invalid or has expired. Request a new one.',
  'Email ini sudah terdaftar. Silakan masuk.': 'This email is already registered. Please sign in.',
  'Email atau kata sandi tidak sesuai.': 'Email or password is incorrect.',
  'Login Google tidak dapat diverifikasi.': 'The Google sign-in could not be verified.',
  'Akun tidak ditemukan.': 'Account not found.',
  'Akun ini sudah punya peran tetap. Satu akun hanya bisa memegang satu peran.': 'This account already has a fixed role. One account can hold only one role.',
  'Pilih peran akun dulu sebelum mengisi profil usaha.': 'Choose an account role before filling in your business profile.',
  'Pilih peran akun dulu.': 'Choose an account role first.',
  'Mitra tidak ditemukan.': 'Partner not found.',
  // kyc
  'Pilih peran akun dulu sebelum mengajukan e-KYC.': 'Choose an account role before submitting e-KYC.',
  'Akunmu sudah terverifikasi.': 'Your account is already verified.',
  'Pengajuan e-KYC sebelumnya masih diproses.': 'Your previous e-KYC submission is still being reviewed.',
  'Unggah foto KTP dan selfie dulu sebelum mengirim pengajuan.': 'Upload your ID card photo and selfie before submitting.',
  'Pengajuanmu sedang diperiksa, foto tidak bisa diganti sekarang.': 'Your submission is under review, so photos cannot be replaced now.',
  'Foto belum terkirim. Pilih berkas JPG atau PNG.': 'No photo was received. Choose a JPG or PNG file.',
  'Ukuran foto maksimal 5 MB.': 'Photos can be up to 5 MB.',
  'Berkas harus berupa foto JPG atau PNG.': 'The file must be a JPG or PNG photo.',
  'Akun ini tidak sedang menunggu verifikasi.': 'This account is not waiting for verification.',
  'Alasan penolakan wajib diisi.': 'A reason for rejection is required.',
  'Data identitas ini sudah dipakai atau sedang diproses di akun lain.': 'This identity is already used or being processed on another account.',
  // catalog
  'Hanya vendor yang bisa menambah paket alat.': 'Only vendors can add equipment packages.',
  'Hanya band atau musisi yang bisa mengisi katalog penampilan.': 'Only bands or musicians can fill in a performance catalog.',
  'Paket tidak ditemukan.': 'Package not found.',
  'Peran kamu tidak punya katalog yang bisa diisi.': 'Your role has no catalog to fill in.',
  // events
  'Acara tidak ditemukan.': 'Event not found.',
  'Acara ini tidak membuka pendaftaran.': 'This event is not open for registration.',
  'Penyelenggara tidak bisa menyewa booth acaranya sendiri.': 'Organizers cannot rent a booth at their own event.',
  'Acara ini tidak membuka pendaftaran tenant.': 'This event is not open for tenant registration.',
  'Booth ini sudah terisi atau bukan bagian dari acara ini.': 'This booth is taken or is not part of this event.',
  'Acara ini tidak membuka rekrutmen kru.': 'This event is not recruiting crew.',
  'Shift tidak ditemukan di acara ini.': 'Shift not found in this event.',
  'Kamu sudah melamar shift ini.': 'You already applied for this shift.',
  'Pendaftaran tidak ditemukan atau sudah diputuskan.': 'Application not found or already decided.',
  'Kuota shift ini sudah penuh.': 'This shift is already full.',
  // proposals
  'Kamu bukan pihak dalam pengajuan ini.': 'You are not a party to this proposal.',
  'Saat ini giliran pihak lain untuk menanggapi. Kamu bisa menunggu atau membatalkan pengajuan.': 'It is the other party\'s turn to respond. You can wait or withdraw the proposal.',
  'Pengajuan kerja sama ditujukan ke mitra, bukan ke sesama penyelenggara.': 'Collaboration offers go to partners, not to other organizers.',
  'Pengajuan tidak ditemukan.': 'Proposal not found.',
  'Pilih peran akun dulu sebelum mengajukan kerja sama.': 'Choose an account role before sending a collaboration offer.',
  'Kamu tidak bisa mengajukan ke dirimu sendiri.': 'You cannot send an offer to yourself.',
  'Acara ini tidak sedang membuka kerja sama.': 'This event is not open for collaboration.',
  'Penerima pengajuan tidak ditemukan.': 'The recipient was not found.',
  'Hanya penyelenggara acara ini yang bisa mengundang mitra.': 'Only this event\'s organizer can invite partners.',
  'Pengajuan harus ditujukan ke penyelenggara acara ini.': 'The proposal must be addressed to this event\'s organizer.',
  'Penyelenggara tidak membuka pengajuan untuk jenis ini.': 'The organizer is not accepting offers of this type.',
  'Pengajuan ini baru saja berubah. Muat ulang lalu coba lagi.': 'This proposal just changed. Reload and try again.',
  'Kontrak belum siap didanai.': 'The contract is not ready to be funded.',
  // payments
  'Pembayaran belum dikonfigurasi. Hubungi tim Event Yuk.': 'Payments are not set up yet. Contact the Event Yuk team.',
  'Kontrak tidak ditemukan.': 'Contract not found.',
  'DP kontrak ini sudah dibayar.': 'The deposit for this contract is already paid.',
  'Kontrak belum disepakati kedua pihak.': 'Both sides have not agreed to the contract yet.',
  'Acara kontrak ini tidak ditemukan.': 'The event for this contract was not found.',
  'Hanya pihak pembayar pada kontrak ini yang bisa membayar DP.': 'Only the paying party on this contract can pay the deposit.',
  'Penerima dana belum lolos verifikasi e-KYC, jadi DP belum bisa dibayarkan.': 'The recipient has not passed e-KYC verification, so the deposit cannot be paid yet.',
  'Nominal DP tidak valid.': 'The deposit amount is not valid.',
  'Akun pembayar tidak ditemukan.': 'The paying account was not found.',
  'Signature tidak valid.': 'Invalid signature.',
  'Transaksi tidak dikenal.': 'Unknown transaction.',
  'Nominal tidak sesuai dengan transaksi.': 'The amount does not match the transaction.',
  'Midtrans belum bisa membuat pembayaran. Coba lagi sebentar lagi.': 'Midtrans could not create the payment. Please try again shortly.',
  'Status pembayaran belum bisa diperiksa.': 'The payment status could not be checked.',
  'Dana escrow untuk kontrak ini belum ada.': 'There is no escrow for this contract yet.',
  'Hanya pihak penerima dana yang bisa mengajukan BAST.': 'Only the recipient can submit the handover (BAST).',
  'Hanya pihak pembayar yang bisa menyetujui BAST.': 'Only the paying party can approve the handover (BAST).',
  'BAST sudah diajukan.': 'The BAST was already submitted.',
  'Dana pada kontrak ini sudah dilepas atau belum ditahan.': 'The funds on this contract are already released or not held yet.',
  'Penerima belum mengajukan BAST.': 'The recipient has not submitted the BAST yet.',
  // validation (zod)
  'Tanggal memakai format YYYY-MM-DD.': 'Dates use the YYYY-MM-DD format.',
  'Gunakan alamat https:// atau path yang dimulai dengan /.': 'Use an https:// address or a path starting with /.',
  'Tanggal selesai tidak boleh sebelum tanggal mulai.': 'The end date cannot be before the start date.',
  'Kata sandi minimal 8 karakter.': 'Password must be at least 8 characters.',
  'Kata sandi terlalu panjang.': 'Password is too long.',
  'Nomor telepon belum benar.': 'The phone number is not valid.',
  'Nomor rekening hanya angka (6 sampai 20 digit).': 'Account numbers are digits only (6 to 20 digits).',
  'Email wajib diisi.': 'Email is required.',
  'Format email belum benar.': 'The email format is not valid.',
  'Kode OTP terdiri dari 6 angka.': 'The code has 6 digits.',
  'Kata sandi wajib diisi.': 'Password is required.',
  'NIK terdiri dari 16 angka.': 'NIK has 16 digits.',
  'Nominal harus lebih dari 0.': 'The amount must be greater than 0.',
};

/** Messages that carry values; each pattern rebuilds the English sentence from what it captured. */
const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Pengajuan ini sudah berstatus (.+) dan tidak bisa diubah lagi\.$/, (m) => `This proposal is already ${m[1]} and can no longer be changed.`],
  [/^Jenis pengajuan (.+) tidak cocok dengan peran mitra \((.+)\)\.$/, (m) => `Offer type ${m[1]} does not match the partner role (${m[2]}).`],
  [/^Fitur ini hanya untuk peran: (.+)\.$/, (m) => `This feature is only for the roles: ${m[1]}.`],
];

export function translate(text: string, lang: Lang): string {
  if (lang !== 'en') return text;
  const exact = EN[text];
  if (exact) return exact;
  for (const [re, build] of PATTERNS) {
    const m = text.match(re);
    if (m) return build(m);
  }
  return text;
}

/** The web app sends the language the visitor picked; anything else gets Indonesian. */
export function langOf(req: Pick<Request, 'headers'>): Lang {
  const header = String(req.headers['accept-language'] ?? '').toLowerCase();
  return header.startsWith('en') ? 'en' : 'id';
}
