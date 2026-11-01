import React, { useState } from 'react';
import { X, UploadCloud, Film, Users, DollarSign, Calendar, MapPin, FileCheck } from 'lucide-react';
import { EventItem } from '../data/mockEvents';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEvent: EventItem) => void;
}

export default function UploadPortfolioModal({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: 'CONCERT' as 'CONCERT' | 'PENSI' | 'EXPO' | 'BAZAAR',
    venue: '',
    date: '',
    description: '',
    bannerImage: '',
    attendees: '',
    budget: '',
    aftermovieUrl: '',
    organizerName: 'My Event Organizer Team',
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
        start_date: formData.date.split('-')[0].trim() || '2026-08-01',
        end_date: formData.date.split('-')[1]?.trim() || formData.date.trim() || '2026-08-02',
        attendee_count: parseInt(formData.attendees.replace(/\D/g, '')) || 5000,
        total_budget: parseInt(formData.budget.replace(/\D/g, '')) || 250000000,
        description: formData.description || 'Dokumentasi pelaksanaan acara spektakuler yang sukses digelar.',
        banner_image: formData.bannerImage || '/assets/crowd-festival.jpg',
        aftermovie_url: formData.aftermovieUrl || 'https://youtube.com',
      };

      // Send to Express API & Supabase
      const res = await fetch('/api/v1/events/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        savedDbItem = json.data;
      }
    } catch (err) {
      console.warn('API call failed, adding locally:', err);
    }

    const created: EventItem = {
      id: savedDbItem?.id || ('port-' + Date.now()),
      title: formData.title || 'Event Spesial 2026',
      category: formData.category,
      organizer: {
        name: formData.organizerName || user?.fullName || 'Nusantara Live Kreasi',
        avatar: '/assets/crew-production.jpg',
        verified: true,
        city: 'Indonesia',
      },
      venue: formData.venue || 'Venue Terkemuka',
      date: formData.date || 'Tahun 2026',
      description: formData.description || 'Dokumentasi pelaksanaan acara spektakuler yang sukses digelar.',
      bannerImage:
        formData.bannerImage ||
        '/assets/crowd-festival.jpg',
      isPortfolio: true,
      stats: {
        attendees: formData.attendees ? `${formData.attendees} Orang` : '5.000+ Orang',
        budget: formData.budget ? `Rp ${formData.budget}` : 'Rp 250.000.000',
        rating: 4.9,
        aftermovieUrl: formData.aftermovieUrl || 'https://youtube.com',
      },
    };

    onSuccess(created);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-brand-lime-soft">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 font-bold">
              <FileCheck className="w-5 h-5 text-amber-600" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Upload Portofolio Acara Sukses</h3>
              <p className="text-sm text-slate-500">Tampilkan rekam jejak event yang pernah kamu laksanakan ke dalam katalog publik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Acara / Event</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pentas Seni SMAN 1 Jakarta 2026"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Event</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="CONCERT">Konser Musik</option>
                <option value="PENSI">Pentas Seni (Pensi)</option>
                <option value="BAZAAR">Festival Kuliner & Bazaar</option>
                <option value="EXPO">Pameran / Expo</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Tim / EO kamu</label>
              <input
                type="text"
                placeholder="Nama Organisasi / EO"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Lokasi / Venue
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Istora Senayan, Jakarta"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Waktu Pelaksanaan
              </label>
              <input
                type="text"
                required
                placeholder="Misal: 12 - 14 Agustus 2026"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1 text-sm">
                <Users className="w-3.5 h-3.5 text-amber-600" /> Total Penonton / Pengunjung
              </label>
              <input
                type="text"
                placeholder="Misal: 10.000"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-sm"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1 text-sm">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" /> Estimasi Total Produksi
              </label>
              <input
                type="text"
                placeholder="Misal: 450.000.000"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-sm"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cerita Singkat & Keberhasilan Acara</label>
            <textarea
              rows={3}
              placeholder="Ceritakan keseruan artis pengisi, kepuasan tenant, dan kelancaran produksi..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5 text-slate-400" /> URL Foto Dokumentasi
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-slate-400" /> Link Video Aftermovie
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                value={formData.aftermovieUrl}
                onChange={(e) => setFormData({ ...formData, aftermovieUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Submit Action */}
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
              className="px-5 min-h-12 text-white rounded-full font-bold transition flex items-center gap-2 bg-brand-navy hover:bg-brand-navy-dark transition-colors"
            >
              {loading ? 'Menyimpan...' : 'Tayangkan ke Katalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
