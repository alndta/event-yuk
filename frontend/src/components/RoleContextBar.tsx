import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Sliders,
  Music,
  Store,
  Building2,
  Users,
  ShieldCheck,
  LayoutDashboard,
  DollarSign,
  FileCheck,
  Clock,
  Award,
  ArrowRight,
} from 'lucide-react';
import { UserRole } from './RoleOnboardingModal';

interface Props {
  currentRole: UserRole;
  onOpenCreateEvent?: () => void;
  onOpenUploadPortfolio?: () => void;
}

export default function RoleContextBar({
  currentRole,
  onOpenCreateEvent,
  onOpenUploadPortfolio,
}: Props) {
  const navigate = useNavigate();

  const getRoleDetails = () => {
    switch (currentRole) {
      case 'EO':
        return {
          title: 'Event Organizer & Promotor',
          badgeText: 'Akses Penuh Pengadaan & Escrow Acara',
          icon: Calendar,
          colorClass: 'bg-[#456B39] text-white',
          bgBanner: 'from-[#172D46] via-[#1B3B56] to-[#0B1F31]',
          stats: [
            { label: 'Proyek Acara Aktif', value: '2 Acara', icon: Calendar },
            { label: 'Total Pagu Produksi', value: 'Rp 750 Jt', icon: DollarSign },
            { label: 'Pengajuan Vendor & Band', value: '3 Masuk', icon: FileCheck },
            { label: 'Jaminan Escrow Tersimpan', value: 'Rp 280 Jt', icon: ShieldCheck },
          ],
          primaryActionText: '+ Buat Event Baru',
          onPrimaryAction: onOpenCreateEvent || (() => navigate('/dashboard')),
        };
      case 'VENDOR':
        return {
          title: 'Vendor Produksi & Peralatan',
          badgeText: 'Katalog Alat, Smart Calendar, & Klaim BAST',
          icon: Sliders,
          colorClass: 'bg-indigo-600 text-white',
          bgBanner: 'from-indigo-900/90 via-slate-900 to-slate-950',
          stats: [
            { label: 'Paket Peralatan Aktif', value: '4 Paket', icon: Sliders },
            { label: 'Kalender Terkunci', value: '2 Tanggal', icon: Clock },
            { label: 'Penawaran Berjalan', value: '1 Menunggu SPK', icon: FileCheck },
            { label: 'Saldo Siap Tarik (Bank)', value: 'Rp 42.500.000', icon: DollarSign },
          ],
          primaryActionText: 'Kelola Katalog Alat',
          onPrimaryAction: () => navigate('/dashboard'),
        };
      case 'TALENT':
        return {
          title: 'Talenta & Manajemen Band Musik',
          badgeText: 'Jadwal Manggung, Riders Teknis, & PKS Manggung',
          icon: Music,
          colorClass: 'bg-purple-600 text-white',
          bgBanner: 'from-purple-950 via-slate-900 to-slate-950',
          stats: [
            { label: 'Jadwal Tampil (Confirmed)', value: '1 Pensi', icon: Calendar },
            { label: 'Status Technical Riders', value: 'Terverifikasi', icon: ShieldCheck },
            { label: 'Penawaran Masuk dari EO', value: '2 Acara', icon: FileCheck },
            { label: 'Honor Tertahan di Escrow', value: 'Rp 35.000.000', icon: DollarSign },
          ],
          primaryActionText: 'Kelola Riders & Rate Card',
          onPrimaryAction: () => navigate('/dashboard'),
        };
      case 'TENANT':
        return {
          title: 'Tenant Bazaar & Pameran',
          badgeText: 'Pemilihan Kaveling, Kurasi Merek, & QR Pass',
          icon: Store,
          colorClass: 'bg-emerald-600 text-white',
          bgBanner: 'from-emerald-950 via-slate-900 to-slate-950',
          stats: [
            { label: 'Booth Tersewa', value: '1 Booth (FNB-04)', icon: Store },
            { label: 'Status Kurasi Produk', value: 'Disetujui EO', icon: ShieldCheck },
            { label: 'Digital Exhibitor Pass', value: 'Aktif Ber-QR', icon: FileCheck },
            { label: 'Jaminan Dana Sewa', value: '100% Escrow', icon: ShieldCheck },
          ],
          primaryActionText: 'Kelola Menu & Produk Tenant',
          onPrimaryAction: () => navigate('/dashboard'),
        };
      case 'SPONSOR':
        return {
          title: 'Sponsor & Mitra Brand',
          badgeText: 'Paket Sponsorship, Aktivasi Stan, & Laporan Acara',
          icon: Building2,
          colorClass: 'bg-amber-600 text-white',
          bgBanner: 'from-amber-950 via-slate-900 to-slate-950',
          stats: [
            { label: 'Event yang Didukung', value: '1 Konser', icon: Calendar },
            { label: 'Ukuran Stan Aktivasi', value: '6x6 Meter', icon: Building2 },
            { label: 'Status Kontrak MoU', value: 'Ditandatangani', icon: FileCheck },
            { label: 'Estimasi Impresi Audiens', value: '15.000 Pax', icon: Users },
          ],
          primaryActionText: 'Kelola Paket Sponsorship',
          onPrimaryAction: () => navigate('/dashboard'),
        };
      case 'CREW':
        return {
          title: 'Event Crew Lapangan',
          badgeText: 'Lowongan Shift Anti-Bentrok & Presensi QR GPS',
          icon: Users,
          colorClass: 'bg-rose-600 text-white',
          bgBanner: 'from-rose-950 via-slate-900 to-slate-950',
          stats: [
            { label: 'Shift Diterima (Hired)', value: '2 Shift (LO & Usher)', icon: Calendar },
            { label: 'Presensi QR Lokasi Acara', value: 'Radius < 50m', icon: ShieldCheck },
            { label: 'Honor Siap Cair Pasca-Shift', value: 'Rp 750.000', icon: DollarSign },
            { label: 'Rating Kehadiran Kru', value: '5.0 / 5.0', icon: Award },
          ],
          primaryActionText: 'Kelola Keahlian & Shift',
          onPrimaryAction: () => navigate('/dashboard'),
        };
    }
  };

  const details = getRoleDetails();
  const RoleIcon = details.icon;

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${details.bgBanner} text-white p-5 sm:p-7  border border-slate-800`}>
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        {/* Left Info */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${details.colorClass} `}>
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{details.title}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>1 Akun = 1 Peran Tetap</span>
            </span>
            <span className="text-sm text-slate-300 font-medium hidden sm:inline">
              • {details.badgeText}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Ruang Kerja & Kendali Peran Aktif kamu
          </h2>
          <p className="text-sm sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Sistem otomatis menyesuaikan fitur, izin pengajuan, dan hak akses transaksi berdasarkan profil peran yang sedang kamu gunakan saat ini.
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition flex items-center gap-1.5 backdrop-blur-sm"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-coral" />
            <span>Buka Dashboard Dagangan</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </button>

          {currentRole === 'EO' && onOpenUploadPortfolio && (
            <button
              onClick={onOpenUploadPortfolio}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-sm transition flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Upload Portofolio EO</span>
            </button>
          )}

          <button
            onClick={details.onPrimaryAction}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-bold text-sm transition flex items-center gap-2  ${
              currentRole === 'EO'
                ? 'bg-gradient-to-r from-[#456B39] to-[#5E7628] hover:from-[#2F5232] hover:to-[#3F531D] text-white /25'
                : 'bg-white hover:bg-slate-100 text-[#172D46]'
            }`}
          >
            <span>{details.primaryActionText}</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Stats Strip */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 mt-5 sm:mt-6 pt-5 border-t border-white/10">
        {details.stats.map((s, idx) => {
          const SIcon = s.icon;
          return (
            <div key={idx} className="bg-white/5 backdrop-blur-md p-3 sm:p-3.5 rounded-lg border border-white/10">
              <div className="text-sm text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <SIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="truncate">{s.label}</span>
              </div>
              <div className="text-base sm:text-lg font-extrabold tracking-tight text-white tabular-nums truncate">
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Background radial accent */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
