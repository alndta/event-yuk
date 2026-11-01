import useDialog from '../hooks/useDialog';
import React, { useState } from 'react';
import { X, UploadCloud, Film, Users, DollarSign, Calendar, MapPin, FileCheck } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function UploadPortfolioModalInner({ isOpen, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const dialogRef = useDialog(onClose);
  const [formData, setFormData] = useState({
    title: '',
    category: 'CONCERT' as 'CONCERT' | 'PENSI' | 'EXPO' | 'BAZAAR',
    venue: '',
    startDate: '',
    endDate: '',
    description: '',
    bannerImage: '',
    attendees: '',
    budget: '',
    aftermovieUrl: '',
    organizerName: 'My Event Organizer Team',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api('/events/portfolio', {
        method: 'POST',
        body: {
          title: formData.title,
          event_category: formData.category,
          venue_name: formData.venue,
          start_date: formData.startDate,
          end_date: formData.endDate,
          attendee_count: parseInt(formData.attendees.replace(/\D/g, '')) || 0,
          total_budget: parseInt(formData.budget.replace(/\D/g, '')) || 0,
          description: formData.description,
          banner_image: formData.bannerImage || undefined,
          aftermovie_url: formData.aftermovieUrl || undefined,
        },
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('upf.saveFail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dialogRef} className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-brand-lime-soft">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 font-bold">
              <FileCheck className="w-5 h-5 text-amber-600" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">{t('upf.01')}</h3>
              <p className="text-sm text-slate-500">{t('upf.02')}</p>
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
          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-800">{error}</p>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('upf.03')}</label>
            <input
              type="text"
              required
              placeholder={t('upf.04')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('upf.05')}</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="CONCERT">{t('upf.06')}</option>
                <option value="PENSI">{t('upf.07')}</option>
                <option value="BAZAAR">{t('upf.08')}</option>
                <option value="EXPO">{t('upf.09')}</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('upf.10')}</label>
              <input
                type="text"
                placeholder={t('upf.11')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t('upf.venue')}
              </label>
              <input
                type="text"
                required
                placeholder={t('upf.12')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {t('upf.dates')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  aria-label={t('upf.13')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: formData.endDate && formData.endDate < e.target.value ? e.target.value : formData.endDate })}
                />
                <input
                  type="date"
                  required
                  aria-label={t('upf.14')}
                  min={formData.startDate}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1 text-sm">
                <Users className="w-3.5 h-3.5 text-amber-600" /> {t('upf.audience')}
              </label>
              <input
                type="text"
                placeholder={t('upf.15')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-sm"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1 text-sm">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" /> {t('upf.cost')}
              </label>
              <input
                type="text"
                placeholder={t('upf.16')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-sm"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('upf.17')}</label>
            <textarea
              rows={3}
              placeholder={t('upf.18')}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5 text-slate-400" /> URL foto dokumentasi
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
                <Film className="w-3.5 h-3.5 text-slate-400" /> {t('upf.film')}
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
              {loading ? t('upf.saving') : t('upf.publish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UploadPortfolioModal(props: Props) {
  if (!props.isOpen) return null;
  return <UploadPortfolioModalInner {...props} />;
}
