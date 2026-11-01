import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

const linkClass = 'text-sm leading-6 text-slate-300 transition-colors hover:text-white';

export default function Footer() {
  return (
    <footer className="mt-20 bg-brand-ink text-slate-200">
      <div className="bg-brand-navy px-5 py-7 sm:px-8 lg:px-12 2xl:px-16">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold text-white">
              Transaksi Terproteksi Rekening Bersama Escrow
            </h2>
            <p className="mt-2 text-sm leading-6 text-white">
              Pencairan dana bertahap DP 30-50% &amp; pelunasan instan setelah BAST digital disetujui bersama.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white">
            <span>Escrow Midtrans Berizin BI</span>
            <span>e-KYC &amp; PKS Digital</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 2xl:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <img src="/logo-event-yuk.png" alt="" className="h-10 w-auto object-contain" />
              <span className="text-lg font-semibold text-white">Event Yuk</span>
            </Link>
            <p className="max-w-md text-sm leading-6 text-slate-300">
              Satu ekosistem yang menghubungkan penyelenggara, vendor, talent, tenant, sponsor, dan kru acara.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-lime" />
                Jakarta Selatan, DKI Jakarta 12190
              </p>
              <p className="flex items-center gap-2">
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-lime" />
                kerjasama@eventyuk.id
              </p>
            </div>
          </div>

          <nav aria-label="Eksplorasi">
            <h3 className="mb-4 text-base font-semibold text-white">Eksplorasi</h3>
            <ul className="space-y-2">
              <li><Link to="/events" className={linkClass}>Proyek acara</Link></li>
              <li><Link to="/organizers" className={linkClass}>Penyelenggara</Link></li>
              <li><Link to="/bands" className={linkClass}>Band &amp; talent</Link></li>
              <li><Link to="/vendors" className={linkClass}>Vendor produksi</Link></li>
              <li><Link to="/sponsors" className={linkClass}>Sponsor</Link></li>
            </ul>
          </nav>

          <nav aria-label="Akun dan dokumen">
            <h3 className="mb-4 text-base font-semibold text-white">Akun dan dokumen</h3>
            <ul className="space-y-2">
              <li><Link to="/profile" className={linkClass}>Profil dan e-KYC</Link></li>
              <li><Link to="/contracts" className={linkClass}>Kontrak PKS</Link></li>
              <li><Link to="/login" className={linkClass}>Masuk</Link></li>
              <li><Link to="/register" className={linkClass}>Daftar akun</Link></li>
              <li>
                <a href="/api-docs" target="_blank" rel="noreferrer" className={linkClass}>
                  Dokumentasi API
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Event Yuk. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span>Syarat &amp; Ketentuan PKS</span>
            <span>Kebijakan Privasi e-KYC</span>
            <span>Protokol Arbitrase Escrow</span>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mt-12 select-none overflow-hidden whitespace-nowrap text-center font-display text-[clamp(4.5rem,21vw,22rem)] font-extrabold leading-[0.8] tracking-[-0.06em] text-white/10"
        >
          Event Yuk
        </p>
      </div>
    </footer>
  );
}
