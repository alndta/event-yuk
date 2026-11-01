import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Sliders,
  Music,
  Store,
  Building2,
  Users,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { UserRole } from '../components/RoleOnboardingModal';
import { SEOHead } from '../components/SEOHead';
import './RolesGuidePage.css';

interface RoleGuideDetail {
  role: UserRole;
  name: string;
  badge: string;
  tagline: string;
  icon: any;
  overview: string;
  features: { title: string; desc: string }[];
  workflow: { title: string; desc: string }[];
  legalAndEscrow: string[];
  faqs: { q: string; a: string }[];
}

export const ROLES_GUIDE_DATA: Record<UserRole, RoleGuideDetail> = {
  EO: {
    role: 'EO',
    name: 'Event Organizer & Promotor',
    badge: 'Penyelenggara Acara',
    tagline: 'Atur proyek, temukan mitra, dan koordinasikan tim acara.',
    icon: Calendar,
    overview:
      'Sebagai EO, kamu mengatur jadwal dan anggaran acara, vendor produksi, tenant, talent, serta kru. Panduan ini merangkum hal yang perlu disiapkan dari publikasi sampai hari acara.',
    features: [
      {
        title: 'Rincian proyek acara',
        desc: 'Catat tanggal, lokasi, target pengunjung, dan anggaran yang direncanakan.',
      },
      {
        title: 'Penawaran dari vendor',
        desc: 'Lihat paket vendor atau kirim permintaan penawaran dengan termin yang disepakati.',
      },
      {
        title: 'Kebutuhan kru dan presensi',
        desc: 'Buka lowongan shift, tinjau lamaran, dan atur presensi QR di lokasi acara.',
      },
      {
        title: 'Kaveling dan denah tenant',
        desc: 'Susun denah booth, tinjau profil tenant, dan atur kaveling yang ditawarkan.',
      },
      {
        title: 'Catatan dana proyek',
        desc: 'Pantau dana sewa booth yang sudah cair dan penggunaannya untuk biaya proyek.',
      },
      {
        title: 'Portofolio acara',
        desc: 'Tambahkan galeri, aftermovie, dan jumlah penonton dari acara sebelumnya ke profil organizer.',
      },
    ],
    workflow: [
      {
        title: 'Rencanakan acara',
        desc: 'Isi tanggal, venue, anggaran, dan siapa yang boleh mengajukan proposal.',
      },
      {
        title: 'Pilih mitra',
        desc: 'Buka pendaftaran tenant dan kru, lalu undang vendor atau talent.',
      },
      {
        title: 'Sepakati kontrak dan pembayaran',
        desc: 'Pastikan harga, termin, dan ruang lingkup tertulis di PKS sebelum pembayaran.',
      },
      {
        title: 'Jalankan acara dan serah terima',
        desc: 'Pantau persiapan venue dan catat serah terima alat bersama vendor.',
      },
    ],
    legalAndEscrow: [
      'Dana pembayaran DP dan pelunasan tersimpan aman di rekening bersama Escrow Midtrans atas nama proyek acara.',
      'Kontrak PKS digital memiliki dasar hukum sah dan mengikat para pihak.',
      'EO dilindungi hak arbitrase jika vendor gagal memenuhi spesifikasi teknis riders yang telah ditandatangani.',
    ],
    faqs: [
      {
        q: 'Apakah EO bisa membatasi pengajuan proposal dari pihak luar?',
        a: 'Ya, EO memiliki opsi toggle "Izinkan Penawaran Vendor Terbuka", "Izinkan Proposal Band Terbuka", atau mode "Khusus Undangan (Invite-Only)".',
      },
      {
        q: 'Bagaimana mekanisme pengembalian dana (refund) jika terjadi pembatalan?',
        a: 'Jika terjadi pembatalan sepihak sebelum instalasi alat, sistem Escrow secara otomatis memproses pengembalian dana sesuai klausul PKS yang disepakati.',
      },
    ],
  },
  VENDOR: {
    role: 'VENDOR',
    name: 'Vendor Produksi Alat & Panggung',
    badge: 'Produksi & Perlengkapan',
    tagline: 'Tampilkan layanan produksi dan kelola permintaan dari penyelenggara.',
    icon: Sliders,
    overview:
      'Sebagai vendor produksi, kamu menyediakan perlengkapan teknis seperti sound system, rigging, tata cahaya, videotron, atau genset. Cantumkan spesifikasi, jadwal, dan ketentuan sewa dengan jelas.',
    features: [
      {
        title: 'Paket alat dan jadwal',
        desc: 'Atur spesifikasi, harga sewa, jumlah unit, dan tanggal yang tersedia.',
      },
      {
        title: 'Bukti pengiriman dan instalasi',
        desc: 'Unggah surat jalan atau foto instalasi alat di venue sebagai bukti pekerjaan.',
      },
      {
        title: 'Serah terima alat',
        desc: 'Catat kondisi alat dalam Berita Acara Serah Terima bersama penyelenggara.',
      },
      {
        title: 'Penawaran harga khusus',
        desc: 'Sesuaikan harga dan termin saat membalas undangan penyelenggara.',
      },
    ],
    workflow: [
      {
        title: 'Lengkapi katalog alat',
        desc: 'Cantumkan jumlah unit, kebutuhan daya, ukuran panggung, dan informasi keselamatan.',
      },
      {
        title: 'Tinjau pesanan',
        desc: 'Periksa jadwal dan penawaran acara sebelum menyepakati pesanan.',
      },
      {
        title: 'Siapkan pengiriman',
        desc: 'Cek status transaksi dan jadwal pengiriman yang tertulis di kesepakatan.',
      },
      {
        title: 'Catat serah terima',
        desc: 'Dokumentasikan kondisi alat bersama penyelenggara setelah acara.',
      },
    ],
    legalAndEscrow: [
      'Jaminan pembayaran 100% anti gagal bayar karena dana kontrak telah diamankan sebelum acara dimulai.',
      'Klausul ganti rugi kerusakan alat jika terjadi insiden di venue akibat kelalaian panitia.',
    ],
    faqs: [
      {
        q: 'Kapan DP sewa alat dicairkan ke rekening vendor?',
        a: 'DP dicairkan saat vendor mengunggah bukti surat jalan loading alat ke lokasi acara yang diverifikasi sistem.',
      },
      {
        q: 'Bisakah vendor melampirkan draf SPK resmi internal sendiri?',
        a: 'Bisa. Sistem mengizinkan pengunggahan berkas kontrak mandiri dalam format PDF atau Word (DOC/DOCX).',
      },
    ],
  },
  TALENT: {
    role: 'TALENT',
    name: 'Manajemen Band, Musisi & Artis',
    badge: 'Talenta & Hiburan',
    tagline: 'Atur profil, riders, dan penawaran tampil untuk band atau musisi.',
    icon: Music,
    overview:
      'Sebagai band, musisi, atau manajemen talent, kamu menyiapkan profil, tarif, jadwal tampil, serta kebutuhan panggung dan hospitality. Cantumkan detailnya sebelum menyepakati tawaran acara.',
    features: [
      {
        title: 'Profil dan portofolio',
        desc: 'Tampilkan genre, statistik streaming, video panggung, dan penampilan sebelumnya.',
      },
      {
        title: 'Tarif dan durasi tampil',
        desc: 'Cantumkan honor yang diharapkan, durasi tampil, dan kebutuhan kapasitas panggung.',
      },
      {
        title: 'Riders panggung dan hospitality',
        desc: 'Tulis kebutuhan instrumen, backline, konsumsi, dan akomodasi dalam riders.',
      },
      {
        title: 'Negosiasi honor dan termin',
        desc: 'Bahas honor dan termin pembayaran dengan promotor sebelum menyepakati acara.',
      },
    ],
    workflow: [
      {
        title: 'Lengkapi profil dan riders',
        desc: 'Cantumkan kebutuhan mikrofon, backline, dan ruang transit backstage.',
      },
      {
        title: 'Tinjau tawaran tampil',
        desc: 'Periksa profil acara, venue, jadwal, dan honor sebelum memberi jawaban.',
      },
      {
        title: 'Sepakati kontrak dan termin',
        desc: 'Cantumkan honor, jadwal, dan kebutuhan panggung di PKS sebelum menyetujui pembayaran.',
      },
      {
        title: 'Tampil sesuai kesepakatan',
        desc: 'Ikuti jadwal dan durasi yang disepakati, lalu catat perubahan pada hari acara.',
      },
    ],
    legalAndEscrow: [
      'Honor manggung terlindungi rekening bersama sehingga terhindar dari resiko promotor kabur setelah artis selesai tampil.',
      'Kewajiban penyelenggara menyediakan riders teknis sesuai spesifikasi tertulis.',
    ],
    faqs: [
      {
        q: 'Bagaimana jika EO tidak menyediakan sound system sesuai technical riders?',
        a: 'Manajemen band berhak mengajukan penyesuaian atau klaim arbitrase sesuai klausul riders pada dokumen PKS digital.',
      },
    ],
  },
  TENANT: {
    role: 'TENANT',
    name: 'Tenant Bazaar, Kuliner & Apparel',
    badge: 'Bazaar & UMKM',
    tagline: 'Cari event, ajukan produk, dan pilih booth bazaar.',
    icon: Store,
    overview:
      'Sebagai tenant, kamu bisa membuka booth di bazaar, festival kuliner, atau pameran. Lihat denah dan ketentuan tiap acara sebelum memilih kaveling.',
    features: [
      {
        title: 'Pilih kaveling booth',
        desc: 'Lihat nomor, ukuran, dan harga kaveling pada denah acara.',
      },
      {
        title: 'Kirim produk untuk kurasi',
        desc: 'Kirim foto menu atau katalog produk untuk ditinjau penyelenggara.',
      },
      {
        title: 'Tenggat pemesanan booth',
        desc: 'Periksa batas waktu pembayaran setelah pengajuan booth disetujui.',
      },
      {
        title: 'Pass digital tenant',
        desc: 'Lihat informasi akses dan pass peserta yang disediakan untuk acara.',
      },
    ],
    workflow: [
      {
        title: 'Cari event yang membuka booth',
        desc: 'Pilih acara yang sesuai dengan produk dan target pengunjungmu.',
      },
      {
        title: 'Pilih booth dan kirim produk',
        desc: 'Pilih nomor kaveling pada denah, lalu kirim menu atau katalog produk.',
      },
      {
        title: 'Cek hasil kurasi dan biaya',
        desc: 'Tinjau harga, fasilitas, dan tenggat pembayaran sebelum menyewa booth.',
      },
      {
        title: 'Siapkan booth untuk acara',
        desc: 'Ikuti petunjuk akses venue dan jadwal pemasangan dari penyelenggara.',
      },
    ],
    legalAndEscrow: [
      'Dana sewa booth terlindungi rekening bersama dan dialokasikan untuk fasilitas venue (listrik, kebersihan, keamanan).',
      'Jaminan komitmen kaveling tidak akan dipindahtangankan kepada pihak lain.',
    ],
    faqs: [
      {
        q: 'Apakah fasilitas listrik dan tenda sudah termasuk biaya sewa?',
        a: 'Rincian fasilitas daya watt listrik, meja, dan tenda dicantumkan transparan pada masing-masing spesifikasi kaveling booth.',
      },
    ],
  },
  SPONSOR: {
    role: 'SPONSOR',
    name: 'Mitra Sponsor, FMCG & Brand Partner',
    badge: 'Sponsor & Korporat',
    tagline: 'Temukan peluang kemitraan dan sepakati hak aktivasi merek.',
    icon: Building2,
    overview:
      'Sebagai sponsor atau agensi, kamu mencari acara yang selaras dengan target merek dan bentuk aktivasi yang direncanakan. Bandingkan informasi yang tersedia, lalu sepakati hak dan deliverables secara tertulis.',
    features: [
      {
        title: 'Informasi audiens acara',
        desc: 'Tinjau informasi audiens yang dicantumkan penyelenggara pada detail acara.',
      },
      {
        title: 'Paket sponsorship',
        desc: 'Bandingkan isi paket dan rincian aktivitas sebelum mengajukan kerja sama.',
      },
      {
        title: 'Hak aktivasi merek',
        desc: 'Bahas kategori, area booth, dan bentuk aktivasi dengan penyelenggara.',
      },
      {
        title: 'Dokumentasi pasca-acara',
        desc: 'Tinjau dokumentasi dan laporan yang disediakan setelah acara.',
      },
    ],
    workflow: [
      {
        title: 'Cocokkan audiens dan target',
        desc: 'Tinjau informasi audiens untuk melihat kesesuaiannya dengan target merek.',
      },
      {
        title: 'Pilih paket atau ajukan ide',
        desc: 'Ajukan paket yang tersedia atau sampaikan kebutuhan aktivasi khusus.',
      },
      {
        title: 'Sepakati kerja sama',
        desc: 'Catat hak aktivasi, jadwal, nilai, dan dokumen kerja sama.',
      },
      {
        title: 'Jalankan aktivasi',
        desc: 'Laksanakan aktivasi sesuai kesepakatan dan kumpulkan dokumentasinya.',
      },
    ],
    legalAndEscrow: [
      'Klausul pemenuhan hak deliverables branding (penayangan video LED, penempatan logo billboard, dsb.) secara ketat diawasi.',
      'Sistem pembayaran termin bertahap sesuai milestone persiapan promosi.',
    ],
    faqs: [
      {
        q: 'Bisakah brand meminta custom activation yang tidak ada di paket standar?',
        a: 'Bisa, Anda dapat mengisi rincian permintaan hak aktivasi kustom pada formulir pengajuan kemitraan langsung ke EO.',
      },
    ],
  },
  CREW: {
    role: 'CREW',
    name: 'Event Crew Lapangan Harian',
    badge: 'Tenaga Kerja Lepas',
    tagline: 'Cari shift yang cocok dan pahami tugas sebelum melamar.',
    icon: Users,
    overview:
      'Sebagai kru lapangan, kamu membantu operasional acara sebagai LO, usher, stagehand, ticketing, atau runner. Periksa jadwal, lokasi, tugas, dan honor sebelum melamar.',
    features: [
      {
        title: 'Cari dan lamar shift',
        desc: 'Temukan posisi dan jam kerja yang sesuai, lalu kirim lamaran.',
      },
      {
        title: 'Presensi QR di lokasi',
        desc: 'Catat kehadiran dengan memindai kode QR koordinator saat mulai dan selesai bertugas.',
      },
      {
        title: 'Informasi pembayaran honor',
        desc: 'Periksa nilai honor dan ketentuan pembayaran sebelum menerima shift.',
      },
      {
        title: 'Riwayat kerja kru',
        desc: 'Simpan catatan shift yang sudah diselesaikan untuk melengkapi profil kru.',
      },
    ],
    workflow: [
      {
        title: 'Pilih posisi dan jam kerja',
        desc: 'Tinjau tugas, lokasi, jadwal, dan nilai honor pada tiap lowongan.',
      },
      {
        title: 'Kirim lamaran',
        desc: 'Kirim profil dan tunggu kabar dari koordinator acara.',
      },
      {
        title: 'Check-in di venue',
        desc: 'Datang sesuai jadwal dan pindai kode QR koordinator untuk mencatat kehadiran.',
      },
      {
        title: 'Selesaikan shift',
        desc: 'Catat waktu selesai bertugas dan cek ketentuan pembayaran honor.',
      },
    ],
    legalAndEscrow: [
      'Gaji kru dijamin aman di rekening penampungan Escrow dan tidak dapat ditarik kembali oleh EO selama kru menjalankan tugas.',
      'Sertifikat digital partisipasi kru untuk portofolio karir industri event.',
    ],
    faqs: [
      {
        q: 'Apakah saya bisa melamar 2 posisi kru di hari yang sama?',
        a: 'Hanya bisa jika jam shift keduanya tidak bertabrakan dan berada di lokasi yang memungkinkan perpindahan.',
      },
    ],
  },
};

export default function RolesGuidePage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('EO');
  const activeGuide = ROLES_GUIDE_DATA[selectedRole];

  const roleOptions: { id: UserRole; label: string; icon: any; image: string; alt: string }[] = [
    { id: 'EO', label: 'Penyelenggara', icon: Calendar, image: '/assets/crowd-festival.jpg', alt: 'Pengunjung menikmati acara musik' },
    { id: 'VENDOR', label: 'Vendor produksi', icon: Sliders, image: '/assets/vendor-sound.jpg', alt: 'Konsol audio dan perlengkapan produksi musik' },
    { id: 'TALENT', label: 'Musisi & band', icon: Music, image: '/assets/band-jazz.jpg', alt: 'Pemain musik tampil bersama di panggung' },
    { id: 'TENANT', label: 'Tenant bazaar', icon: Store, image: '/assets/tenant-bazaar.jpg', alt: 'Tangan mengangkat beberapa cangkir minuman' },
    { id: 'SPONSOR', label: 'Mitra sponsor', icon: Building2, image: '/assets/sponsor-activation.jpg', alt: 'Ruang acara yang disiapkan untuk kegiatan bersama' },
    { id: 'CREW', label: 'Kru acara', icon: Users, image: '/assets/crew-production.jpg', alt: 'Tim berdiskusi sambil bekerja dengan laptop' },
  ];

  return (
    <div className="guide-page -mx-5 -mt-6 -mb-[6.5rem] sm:-mx-8 sm:-mt-8 sm:-mb-28 lg:-mx-12 2xl:-mx-16 font-sans">
      <SEOHead
        title="Panduan Peran di Ekosistem Acara | Event Yuk"
        description="Kenali enam peran di Event Yuk, lihat cara kerja tiap mitra, dan ikuti tiga langkah pendaftaran akun."
        keywords="panduan peran event organizer, vendor acara, musisi, tenant bazaar, sponsor, kru acara"
        canonicalPath="/roles-guide"
      />

      <section className="guide-chapter guide-hero">
        <div className="guide-shell guide-hero__layout">
          <div className="guide-hero__copy">
            <h1><span>Pilih peranmu</span><span>di dunia acara</span></h1>
            <p>Kenali enam peran, lihat alurnya, lalu daftar dengan langkah yang jelas.</p>
            <a className="guide-action guide-action--lime" href="#peran">
              Lihat peran <ArrowRight aria-hidden="true" />
            </a>
          </div>

          <div className="guide-hero__scene" aria-label="Pratinjau alur pendaftaran Event Yuk">
            <img
              className="guide-hero__photo"
              src="/assets/crew-production.jpg"
              alt="Tim berdiskusi sambil bekerja dengan laptop"
              width="800"
              height="534"
            />
            <div className="guide-register-card" data-ui="true">
              <div className="guide-register-card__head">
                <span>Event Yuk</span>
                <strong>Daftar akun</strong>
              </div>
              <ol className="guide-register-steps">
                <li className="is-current"><span>1</span><strong>Pilih peran</strong></li>
                <li><span>2</span><strong>Isi data akun</strong></li>
                <li><span>3</span><strong>Verifikasi email</strong></li>
              </ol>
              <p>Pilih jalur yang paling sesuai dengan pekerjaanmu di acara.</p>
            </div>
            <p className="guide-hero__caption">Kolaborasi acara dimulai dari orang-orangnya.</p>
          </div>
        </div>
      </section>

      <section id="peran" className="guide-chapter guide-roles">
        <div className="guide-shell">
          <div className="guide-section-heading">
            <h2>Peranmu dalam acara</h2>
            <p>Pilih satu peran untuk melihat tanggung jawab, fitur, dan alur kerjanya.</p>
          </div>

          <div className="guide-role-grid" role="group" aria-label="Pilih peran">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className="guide-role-option"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedRole(option.id)}
                >
                  <img src={option.image} alt={option.alt} width="800" height="533" loading="lazy" />
                  <span className="guide-role-option__name">
                    <Icon aria-hidden="true" />
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="guide-role-summary" aria-live="polite">
            <div>
              <h3>{activeGuide.name}</h3>
              <p className="guide-role-summary__tagline">{activeGuide.tagline}</p>
            </div>
            <div className="guide-role-summary__detail">
              <p>{activeGuide.overview}</p>
              <Link to="/register" className="guide-text-link">
                Buka formulir pendaftaran <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="guide-chapter guide-features">
        <div className="guide-shell">
          <div className="guide-section-heading">
            <h2>Yang bisa kamu kerjakan</h2>
            <p>Fitur untuk {activeGuide.badge.toLowerCase()}.</p>
          </div>
          <ul className="guide-feature-list">
            {activeGuide.features.map((feature) => (
              <li key={feature.title}>
                <CheckCircle2 aria-hidden="true" />
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="guide-chapter guide-workflow">
        <div className="guide-shell">
          <div className="guide-section-heading">
            <h2>Alur kerja di lapangan</h2>
            <p>Dari persiapan sampai acara selesai, setiap peran punya urutan kerja yang berbeda.</p>
          </div>
          <ol className="guide-workflow-list">
            {activeGuide.workflow.map((item, index) => (
              <li key={item.title}>
                <span className="guide-workflow-list__number">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="guide-chapter guide-agreements">
        <div className="guide-shell guide-agreements__layout">
          <div>
            <ShieldCheck aria-hidden="true" className="guide-agreements__icon" />
            <h2>Pastikan kesepakatan jelas</h2>
            <p className="guide-agreements__intro">
              Cek isi kontrak, termin pembayaran, dan tanggung jawab masing-masing sebelum menyetujui kerja sama.
            </p>
            <ul className="guide-agreement-list">
              {activeGuide.legalAndEscrow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="guide-faq">
            <h2>Pertanyaan umum</h2>
            {activeGuide.faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-chapter guide-cta">
        <div className="guide-shell guide-cta__layout">
          <h2>Mulai dari peranmu</h2>
          <p>Pilih peran, isi data akun, lalu verifikasi email untuk masuk.</p>
          <Link to="/register" className="guide-action guide-action--navy">
            Daftar akun <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
