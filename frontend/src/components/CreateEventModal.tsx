import React, { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  DollarSign,
  Sliders,
  Music,
  Store,
  Users,
  Lock,
  Globe,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { EventItem } from '../data/mockEvents';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEvent: EventItem) => void;
}

export default function CreateEventModal({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: 'CONCERT' as 'CONCERT' | 'PENSI' | 'EXPO' | 'BAZAAR',
    venue: '',
    date: '',
    budget: '',
    description: '',
    bannerImage: '',
    allowVendorProposals: true,
    allowTalentProposals: true,
    allowTenantRegistrations: true,
    allowCrewApplications: true,
    isInviteOnly: false,
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let savedDbItem: any = null;

    try {
      const payload = {
        organizer_id: user?.id || 'a0000000-0000-0000-0000-000000000001',
        title: formData.title,
        event_category: formData.category,
        venue_name: formData.venue || 'Venue Terpilih',
        start_date: formData.date.split('-')[0].trim() || '2027-08-15',
        end_date: formData.date.split('-')[1]?.trim() || formData.date.trim() || '2027-08-16',
        total_budget: parseInt(formData.budget.replace(/\D/g, '')) || 350000000,
        description: formData.description || 'Proyek acara baru sedang dalam tahap pengadaan vendor dan pendaftaran tenant.',
        banner_image:
          formData.bannerImage ||
          '/assets/hero-concert.jpg',
        allow_vendor_proposals: formData.allowVendorProposals,
        allow_talent_proposals: formData.allowTalentProposals,
        allow_tenant_registrations: formData.allowTenantRegistrations,
        allow_crew_applications: formData.allowCrewApplications,
        is_invite_only: formData.isInviteOnly,
      };

      const res = await fetch('/api/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.data) {
        savedDbItem = resData.data;
      }
    } catch (err) {
      console.warn('API error, falling back locally:', err);
    }

    const created: EventItem = {
      id: savedDbItem?.id || ('live-' + Date.now()),
      title: formData.title,
      category: formData.category,
      organizer: {
        name: user?.fullName || 'Nusantara Live Kreasi',
        avatar: '/assets/crew-production.jpg',
        verified: true,
        city: 'Indonesia',
      },
      venue: formData.venue || 'Venue Terpilih',
      date: formData.date || 'Tahun 2027',
      description: formData.description || 'Proyek acara baru sedang dalam tahap pengadaan vendor dan pendaftaran tenant.',
      bannerImage:
        formData.bannerImage ||
        '/assets/hero-concert.jpg',
      isPortfolio: false,
      progress: {
        stage: 'Tahap 1: Pembukaan Pengajuan Mitra',
        vendorFilled: 20,
        boothFilled: 0,
        crewNeeded: 15,
      },
    };

    onSuccess(created);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold mb-1">
              <Layers className="w-3.5 h-3.5 text-sky-600" /> Event Project Workspace
            </div>
            <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">
              Bentuk Proyek Acara Baru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan parameter acara dan atur izin pengajuan penawaran untuk vendor, band, tenant, serta kru.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul / Nama Acara</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pentas Seni SMA 1 Jakarta / Nusantara Jazz Festival"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Acara</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="CONCERT">Konser Musik</option>
                <option value="PENSI">Pentas Seni (Pensi)</option>
                <option value="BAZAAR">Bazaar & Festival Kuliner</option>
                <option value="EXPO">Pameran & Expo</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Pagu Anggaran (Rp)
              </label>
              <input
                type="text"
                placeholder="Misal: 350.000.000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Lokasi / Venue Acara
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Istora Senayan, Jakarta"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Pelaksanaan
              </label>
              <input
                type="text"
                required
                placeholder="Misal: 20 - 21 Agustus 2027"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Kebutuhan Acara</label>
            <textarea
              rows={2}
              placeholder="Jelaskan konsep acara, target pengunjung, dan kebutuhan pengadaan panggung/talent..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* PERMISSION CONTROLS (EO SETTINGS) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-600" /> Kontrol Izin Pengajuan Mitra
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Aturan Penerimaan Pengajuan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Vendor Permission */}
              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={formData.allowVendorProposals}
                  onChange={(e) => setFormData({ ...formData, allowVendorProposals: e.target.checked })}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Terima Pengajuan Vendor
                  </div>
                  <div className="text-[11px] text-slate-500">Vendor luar boleh mengajukan penawaran harga alat</div>
                </div>
              </label>

              {/* Band / Talent Permission */}
              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={formData.allowTalentProposals}
                  onChange={(e) => setFormData({ ...formData, allowTalentProposals: e.target.checked })}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-purple-600" /> Terima Pengajuan Band
                  </div>
                  <div className="text-[11px] text-slate-500">Manajer band/musisi boleh mengajukan proposal manggung</div>
                </div>
              </label>

              {/* Tenant Permission */}
              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={formData.allowTenantRegistrations}
                  onChange={(e) => setFormData({ ...formData, allowTenantRegistrations: e.target.checked })}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-emerald-600" /> Buka Kaveling Tenant
                  </div>
                  <div className="text-[11px] text-slate-500">Buka pendaftaran booth bazaar & pameran</div>
                </div>
              </label>

              {/* Crew Permission */}
              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={formData.allowCrewApplications}
                  onChange={(e) => setFormData({ ...formData, allowCrewApplications: e.target.checked })}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-rose-600" /> Buka Rekrutmen Kru
                  </div>
                  <div className="text-[11px] text-slate-500">Membuka lowongan kru shift lapangan</div>
                </div>
              </label>
            </div>

            {/* Private vs Public Toggle */}
            <div className="pt-2 border-t border-slate-200/80">
              <label className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70 cursor-pointer">
                <div className="flex items-center gap-2">
                  {formData.isInviteOnly ? (
                    <Lock className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Globe className="w-4 h-4 text-sky-600" />
                  )}
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      {formData.isInviteOnly ? 'Mode Acara Tertutup (Invite Only)' : 'Mode Acara Terbuka (Public Listing)'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {formData.isInviteOnly
                        ? 'Hanya mitra yang diundang langsung oleh EO yang dapat bekerjasama'
                        : 'Acara tampil di beranda dan terbuka untuk penawaran mitra terkurasi'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isInviteOnly}
                  onChange={(e) => setFormData({ ...formData, isInviteOnly: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Mempublikasikan...' : 'Publikasikan Proyek Acara'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
