import useDialog from '../hooks/useDialog';
import { useState } from 'react';
import {
  X,
  Calendar,
  Sliders,
  Music,
  Store,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export type UserRole = 'EO' | 'VENDOR' | 'TALENT' | 'TENANT' | 'SPONSOR' | 'CREW';

interface RoleOption {
  role: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Calendar;
  colorClass: string;
  borderClass: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'EO',
    title: 'Event Organizer & Promotor',
    subtitle: 'Penyelenggara Acara / Komite Pensi',
    description: 'Bentuk proyek acara baru, kurasi tenant bazaar, buat SPK vendor, deposit escrow, dan buka rekrutmen kru.',
    icon: Calendar,
    colorClass: 'text-sky-600 bg-sky-50',
    borderClass: 'border-sky-500',
  },
  {
    role: 'VENDOR',
    title: 'Vendor Produksi & Peralatan',
    subtitle: 'Sound System, Stage, Lighting, LED',
    description: 'Kelola paket alat & smart calendar, ajukan penawaran harga ke event, klaim DP instalasi dan pelunasan pasca-BAST.',
    icon: Sliders,
    colorClass: 'text-indigo-600 bg-indigo-50',
    borderClass: 'border-indigo-500',
  },
  {
    role: 'TALENT',
    title: 'Talenta & Manajemen Band',
    subtitle: 'Musisi, Band, MC, Guest Star',
    description: 'Kelola riders teknis & hospitality, terima tawaran manggung dari EO, negosiasi honor dan tanda tangan PKS digital.',
    icon: Music,
    colorClass: 'text-purple-600 bg-purple-50',
    borderClass: 'border-purple-500',
  },
  {
    role: 'TENANT',
    title: 'Tenant Bazaar & Exhibitor',
    subtitle: 'Brand F&B, Retail, Fashion, UMKM',
    description: 'Eksplorasi event terbuka, pilih nomor kaveling pada denah interaktif, ikuti kurasi EO, dan dapatkan QR Exhibitor Pass.',
    icon: Store,
    colorClass: 'text-emerald-600 bg-emerald-50',
    borderClass: 'border-emerald-500',
  },
  {
    role: 'SPONSOR',
    title: 'Sponsor & Mitra Brand',
    subtitle: 'Perusahaan & Aktivasi Merek',
    description: 'Dapatkan proposal sponsorship resmi dari EO terverifikasi, pilih paket aktivasi booth, dan monitor laporan impresi.',
    icon: Building2,
    colorClass: 'text-amber-600 bg-amber-50',
    borderClass: 'border-amber-500',
  },
  {
    role: 'CREW',
    title: 'Event Crew Lapangan',
    subtitle: 'SDM Operasional & Talenta Harian',
    description: 'Lamar lowongan kerja shift (LO, Usher, Stagehand), presensi QR Code Geofencing di lokasi acara, dan terima honor instan.',
    icon: Users,
    colorClass: 'text-rose-600 bg-rose-50',
    borderClass: 'border-rose-500',
  },
];

interface Props {
  isOpen: boolean;
  currentRole: UserRole;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
}

function RoleOnboardingModalInner({ isOpen, currentRole, onClose, onSelectRole }: Props) {
  const dialogRef = useDialog(onClose);
  const [selected, setSelected] = useState<UserRole>(currentRole);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectRole(selected);
    onClose();
  };

  return (
    <div ref={dialogRef} className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-sm font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Multi-Role Onboarding
            </div>
            <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">
              Pilih Peran kamu di Ekosistem Event Yuk
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Satu akun terpadu dapat mengaktifkan dan berpindah peran kapan saja tanpa registrasi ulang.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            const isChosen = selected === opt.role;

            return (
              <div
                key={opt.role}
                onClick={() => setSelected(opt.role)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isChosen
                    ? `${opt.borderClass} bg-slate-50/90  scale-[1.01]`
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`p-2.5 rounded-lg ${opt.colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isChosen ? (
                      <CheckCircle2 className="w-5 h-5 text-sky-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{opt.title}</h4>
                  <div className="text-sm font-medium text-slate-500 mb-2">{opt.subtitle}</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{opt.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="text-sm text-slate-500">
            Peran terpilih: <strong className="text-slate-900">{roleOptions.find((r) => r.role === selected)?.title}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-slate-900 hover:bg-black transition flex items-center gap-1.5"
            >
              <span>Konfirmasi dan masuk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoleOnboardingModal(props: Props) {
  if (!props.isOpen) return null;
  return <RoleOnboardingModalInner {...props} />;
}
