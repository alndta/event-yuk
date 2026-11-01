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
          badgeText: 'Akses penuh pengadaan dan escrow acara',
          icon: Calendar,
          stats: [
            { label: 'Proyek Acara Aktif', value: '2 Acara', icon: Calendar },
            { label: 'Total Pagu Produksi', value: 'Rp 750 Jt', icon: DollarSign },
            { label: 'Pengajuan Vendor & Band', value: '3 Masuk', icon: FileCheck },
            { label: 'Jaminan Escrow Tersimpan', value: 'Rp 280 Jt', icon: ShieldCheck },
          ],
          primaryActionText: 'Buat event baru',
          onPrimaryAction: onOpenCreateEvent || (() => navigate('/dashboard')),
        };
      case 'VENDOR':
        return {
          title: 'Vendor Produksi & Peralatan',
          badgeText: 'Katalog Alat, Smart Calendar, & Klaim BAST',
          icon: Sliders,
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
    <div data-gsap-reveal className="rounded-lg bg-brand-navy p-6 text-white sm:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-lime px-3 py-1 text-sm font-semibold text-brand-navy">
              <RoleIcon aria-hidden="true" className="h-4 w-4" />
              <span>{details.title}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-brand-lime" />
              <span>1 akun, 1 peran tetap</span>
            </span>
          </div>

          <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
            Ruang kerja peranmu
          </h2>
          <p className="max-w-xl text-base leading-7 text-slate-200">
            {details.badgeText}. Fitur, izin pengajuan, dan akses transaksi menyesuaikan peran yang sedang kamu pakai.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-white/40 px-6 text-base font-semibold text-white transition-colors hover:border-white"
          >
            <LayoutDashboard aria-hidden="true" className="h-5 w-5 text-brand-lime" />
            <span>Buka dashboard</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>

          {currentRole === 'EO' && onOpenUploadPortfolio && (
            <button
              type="button"
              onClick={onOpenUploadPortfolio}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-white/40 px-6 text-base font-semibold text-white transition-colors hover:border-white"
            >
              <FileCheck aria-hidden="true" className="h-5 w-5 text-brand-lime" />
              <span>Unggah portofolio</span>
            </button>
          )}

          <button
            type="button"
            onClick={details.onPrimaryAction}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-lime px-6 text-base font-semibold text-brand-navy transition-colors hover:bg-brand-lime-hover"
          >
            <span>{details.primaryActionText}</span>
          </button>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-6 md:grid-cols-4">
        {details.stats.map((s, idx) => {
          const SIcon = s.icon;
          return (
            <div key={idx} className="rounded-lg bg-brand-navy-dark p-4">
              <dt className="mb-1 flex items-center gap-2 text-sm text-slate-300">
                <SIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-lime" />
                <span>{s.label}</span>
              </dt>
              <dd className="font-display text-xl font-extrabold tracking-[-0.02em] text-white tabular-nums">{s.value}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
