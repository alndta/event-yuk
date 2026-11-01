import useDialog from '../hooks/useDialog';
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
import { api, ApiError } from '../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateEventModalInner({ isOpen, onClose, onSuccess }: Props) {
  const dialogRef = useDialog(onClose);
  const [formData, setFormData] = useState({
    title: '',
    category: 'CONCERT' as 'CONCERT' | 'PENSI' | 'EXPO' | 'BAZAAR',
    venue: '',
    startDate: '',
    endDate: '',
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
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api('/events', {
        method: 'POST',
        body: {
          title: formData.title,
          event_category: formData.category,
          venue_name: formData.venue,
          start_date: formData.startDate,
          end_date: formData.endDate,
          total_budget: parseInt(formData.budget.replace(/\D/g, '')) || 0,
          description: formData.description,
          banner_image: formData.bannerImage || undefined,
          allow_vendor_proposals: formData.allowVendorProposals,
          allow_talent_proposals: formData.allowTalentProposals,
          allow_tenant_registrations: formData.allowTenantRegistrations,
          allow_crew_applications: formData.allowCrewApplications,
          is_invite_only: formData.isInviteOnly,
        },
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Acara belum bisa disimpan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dialogRef} className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-sm font-bold mb-1">
              <Layers className="w-3.5 h-3.5 text-sky-600" /> Ruang kerja proyek acara
            </div>
            <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">
              Buat proyek acara baru
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Tentukan parameter acara dan atur izin pengajuan penawaran untuk vendor, band, tenant, serta kru.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-800">{error}</p>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul acara</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pentas Seni SMA 1 Jakarta / Nusantara Jazz Festival"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Acara</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="CONCERT">Konser Musik</option>
                <option value="PENSI">Pentas Seni (Pensi)</option>
                <option value="BAZAAR">Bazaar dan festival kuliner</option>
                <option value="EXPO">Pameran dan expo</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Pagu anggaran (Rp)
              </label>
              <input
                type="text"
                placeholder="Misal: 350.000.000"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Lokasi atau venue
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Istora Senayan, Jakarta"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Pelaksanaan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  aria-label="Tanggal mulai"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: formData.endDate && formData.endDate < e.target.value ? e.target.value : formData.endDate })}
                />
                <input
                  type="date"
                  required
                  aria-label="Tanggal selesai"
                  min={formData.startDate}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi dan kebutuhan acara</label>
            <textarea
              rows={2}
              placeholder="Jelaskan konsep acara, target pengunjung, dan kebutuhan pengadaan panggung/talent..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* PERMISSION CONTROLS (EO SETTINGS) */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-600" /> Izin pengajuan mitra
              </span>
              <span className="text-sm text-slate-500 font-medium">Aturan penerimaan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {/* Vendor Permission */}
              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={formData.allowVendorProposals}
                  onChange={(e) => setFormData({ ...formData, allowVendorProposals: e.target.checked })}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Terima pengajuan vendor
                  </div>
                  <div className="text-sm text-slate-500">Vendor luar boleh mengajukan penawaran harga alat</div>
                </div>
              </label>

              {/* Band / Talent Permission */}
              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={formData.allowTalentProposals}
                  onChange={(e) => setFormData({ ...formData, allowTalentProposals: e.target.checked })}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-purple-600" /> Terima pengajuan band
                  </div>
                  <div className="text-sm text-slate-500">Manajer band/musisi boleh mengajukan proposal manggung</div>
                </div>
              </label>

              {/* Tenant Permission */}
              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={formData.allowTenantRegistrations}
                  onChange={(e) => setFormData({ ...formData, allowTenantRegistrations: e.target.checked })}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-emerald-600" /> Buka kaveling tenant
                  </div>
                  <div className="text-sm text-slate-500">Buka pendaftaran booth bazaar dan pameran</div>
                </div>
              </label>

              {/* Crew Permission */}
              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={formData.allowCrewApplications}
                  onChange={(e) => setFormData({ ...formData, allowCrewApplications: e.target.checked })}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-rose-600" /> Buka rekrutmen kru
                  </div>
                  <div className="text-sm text-slate-500">Membuka lowongan kru shift lapangan</div>
                </div>
              </label>
            </div>

            {/* Private vs Public Toggle */}
            <div className="pt-2 border-t border-slate-200/80">
              <label className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-lg border border-amber-200/70 cursor-pointer">
                <div className="flex items-center gap-2">
                  {formData.isInviteOnly ? (
                    <Lock className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Globe className="w-4 h-4 text-sky-600" />
                  )}
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {formData.isInviteOnly ? 'Mode Acara Tertutup (Invite Only)' : 'Mode Acara Terbuka (Public Listing)'}
                    </div>
                    <div className="text-sm text-slate-500">
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
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold transition flex items-center gap-2"
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

export default function CreateEventModal(props: Props) {
  if (!props.isOpen) return null;
  return <CreateEventModalInner {...props} />;
}
