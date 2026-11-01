import Dialog from '../components/Dialog';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Sliders,
  Music,
  Store,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  DollarSign,
  FileText,
  ExternalLink,
  Lock,
  Layers,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { TranslationKey } from '../i18n/translations';
import { api, ApiError } from '../lib/api';
import { UserRole } from '../types/models';
import { SEOHead } from '../components/SEOHead';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  specs: string[];
  quota?: number;
  status: 'ACTIVE' | 'DRAFT';
}

interface Props {
  onShowToast?: (msg: string) => void;
}

export default function DashboardPage({ onShowToast }: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const role: UserRole = user?.activeRole || 'VENDOR';

  const [wallet, setWallet] = useState<{ escrow_locked: number; available_bal: number }>({
    escrow_locked: 0,
    available_bal: 0,
  });

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    onShowToast?.(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemSpecs, setNewItemSpecs] = useState('');

  const toItem = (p: any): CatalogItem => ({
    id: p.id,
    name: p.package_name || p.title || p.brand_name || 'Item',
    category: p.category || p.event_category || '',
    price: Number(p.base_price || p.rental_price || p.total_budget || 0),
    specs: Array.isArray(p.tech_specs) ? p.tech_specs : p.tech_specs && typeof p.tech_specs === 'object' ? Object.values(p.tech_specs).map(String) : typeof p.tech_specs === 'string' ? [p.tech_specs] : [],
    quota: p.daily_quota || 1,
    status: 'ACTIVE' as const,
  });

  useEffect(() => {
    setLoading(true);
    api('/catalog/my-catalog')
      .then((data) => setCatalogItems((data.catalogItems || []).map(toItem)))
      .catch(() => setCatalogItems([]))
      .finally(() => setLoading(false));

    api('/payments/wallet')
      .then((data) =>
        setWallet({ escrow_locked: Number(data.wallet.escrow_locked) || 0, available_bal: Number(data.wallet.available_bal) || 0 })
      )
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user?.id]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    const specs = newItemSpecs.split('\n').map((x) => x.trim()).filter(Boolean);

    try {
      const body =
        role === 'TALENT'
          ? { stage_name: newItemName, genre: newItemCategory || undefined, base_price: Number(newItemPrice), tech_specs: specs, hospitality_riders: [] }
          : { package_name: newItemName, category: newItemCategory || 'SOUND', base_price: Number(newItemPrice), daily_quota: 1, tech_specs: specs };
      const res = await api('/catalog/item', { method: 'POST', body });
      const saved = toItem(res.item);
      setCatalogItems(role === 'TALENT' ? [saved] : [saved, ...catalogItems]);
      setShowAddModal(false);
      setNewItemName('');
      setNewItemCategory('');
      setNewItemPrice('');
      setNewItemSpecs('');
      triggerToast(`"${saved.name}" ${t('dash.savedOk')}`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : t('dash.saveFail'));
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(t('dash.confirmDelete'))) return;
    try {
      await api(`/catalog/item/${id}`, { method: 'DELETE' });
      setCatalogItems((items) => items.filter((item) => item.id !== id));
      triggerToast(`"${name}" ${t('dash.deleted')}`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : t('dash.deleteFail'));
    }
  };

  const ROLE_ICONS = { VENDOR: Sliders, TALENT: Music, TENANT: Store, EO: Calendar, SPONSOR: Building2, CREW: Users } as const;
  const getRoleHeaderInfo = () => ({
    title: t(`dash.${role}.title` as TranslationKey),
    subtitle: t(`dash.${role}.subtitle` as TranslationKey),
    icon: ROLE_ICONS[role],
    themeColor: 'text-brand-navy bg-brand-lime-soft border-brand-navy/15',
    badgeText: t(`dash.${role}.badge` as TranslationKey),
    catalogLabel: t(`dash.${role}.catalog` as TranslationKey),
    addBtnLabel: t(`dash.${role}.add` as TranslationKey),
    priceUnit: t(`dash.${role}.unit` as TranslationKey),
  });

  // Only vendors and bands keep an editable catalog; other roles see their activity.
  const canEdit = role === 'VENDOR' || role === 'TALENT';

  const roleMeta = getRoleHeaderInfo();
  const RoleIcon = roleMeta.icon;

  if (loading && catalogItems.length === 0) {
    return (
      <div className="space-y-8 font-sans">
        <SEOHead
          title={t('dash.seoTitle')}
          description={t('dash.seoDesc')}
          noIndex={true}
        />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <SEOHead
        title={t('dash.seoTitle')}
        description={t('dash.seoDesc')}
        noIndex={true}
      />
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172D46] text-white px-5 py-3.5 rounded-lg border border-slate-700 flex items-center gap-2.5 text-sm sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Header Profile Banner */}
      <div className="bg-white rounded-lg p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-brand-lime p-0.5 shrink-0">
            <img
              src={user?.avatarUrl || '/assets/crew-production.jpg'}
              alt={user?.fullName || 'User'}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${roleMeta.themeColor}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{roleMeta.badgeText}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-brand-cream text-slate-700">
                <Lock aria-hidden="true" className="w-4 h-4 text-slate-600" />
                <span>{t('dash.oneRole')}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-brand-forest-light text-brand-forest-dark">
                <CheckCircle2 aria-hidden="true" className="w-4 h-4" />
                <span>{user?.kycStatus === 'VERIFIED' ? t('dash.kycOk') : user?.kycStatus === 'PENDING' ? t('dash.kycPending') : t('dash.kycNone')}</span>
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-brand-ink truncate">
              {user?.businessName || user?.fullName || t('dash.fallbackName')}
            </h1>
            <p className="text-sm text-slate-500">
              {[user?.email, user?.cityRegion].filter(Boolean).join(' • ')}
            </p>
          </div>
        </div>

        {/* Shortcut Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/profile"
            className="inline-flex min-h-11 items-center px-5 rounded-full border-2 border-brand-navy/25 hover:border-brand-navy text-sm font-semibold text-brand-ink transition"
          >
            {t('dash.settings')}
          </Link>
          <Link
            to="/contracts"
            className="inline-flex min-h-11 items-center gap-2 px-5 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white text-sm font-semibold transition"
          >
            <FileText aria-hidden="true" className="w-4 h-4" />
            <span>{t('dash.contracts')}</span>
          </Link>
        </div>
      </div>

      {/* 2. Escrow & Wallet Summary Strip */}
      <div className="bg-brand-navy rounded-lg p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime text-brand-navy text-sm font-semibold mb-2">
              <ShieldCheck aria-hidden="true" className="w-4 h-4" />
              <span>{t('dash.escrowBadge')}</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
              {t('dash.moneyTitle')}
            </h2>
          </div>

          <Link
            to="/profile"
            className="inline-flex min-h-11 items-center gap-2 px-5 rounded-full border-2 border-white/40 hover:border-white text-white text-sm font-semibold transition self-start sm:self-auto"
          >
            <span>{t('dash.profileLink')}</span>
            <ExternalLink aria-hidden="true" className="w-4 h-4 text-brand-lime" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          <div className="bg-brand-navy-dark p-5 sm:p-6 rounded-lg">
            <div className="text-sm text-slate-300 font-medium flex items-center gap-2 mb-1">
              <Lock aria-hidden="true" className="w-4 h-4 text-brand-lime" />
              <span>{t('dash.held')}</span>
            </div>
            <div className="font-display text-3xl font-extrabold tracking-[-0.03em] text-white tabular-nums mt-2">
              Rp {wallet.escrow_locked.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-slate-300 mt-2">{t('dash.heldNote')}</div>
          </div>

          <div className="bg-brand-navy-dark p-5 sm:p-6 rounded-lg">
            <div className="text-sm text-slate-300 font-medium flex items-center gap-2 mb-1">
              <DollarSign aria-hidden="true" className="w-4 h-4 text-brand-lime" />
              <span>{t('dash.available')}</span>
            </div>
            <div className="font-display text-3xl font-extrabold tracking-[-0.03em] text-brand-lime tabular-nums mt-2">
              Rp {wallet.available_bal.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-slate-300 mt-2">{t('dash.availableNote')}</div>
          </div>

          <div className="bg-brand-navy-dark p-5 sm:p-6 rounded-lg">
            <div className="text-sm text-slate-300 font-medium flex items-center gap-2 mb-1">
              <ShieldCheck aria-hidden="true" className="w-4 h-4 text-brand-lime" />
              <span>{t('dash.protect')}</span>
            </div>
            <div className="font-display text-xl font-extrabold text-white mt-2">
              {t('dash.gateway')}
            </div>
            <div className="text-sm text-slate-300 mt-2">{t('dash.protectNote')}</div>
          </div>
        </div>
      </div>

      {/* 3. Core Feature: Manajemen Katalog & Dagangan */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border mb-2 ${roleMeta.themeColor}`}>
              <Layers className="w-3.5 h-3.5" />
              <span>{t('dash.activeTag')}</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-brand-ink">
              {roleMeta.catalogLabel}
            </h2>
            <p className="text-base text-slate-600 mt-1">
              {canEdit ? t('dash.catalogNote') : roleMeta.subtitle}
            </p>
          </div>

          {canEdit && <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 px-6 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold text-base transition"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
            <span>{roleMeta.addBtnLabel}</span>
          </button>}
        </div>

        {/* Catalog Items Grid */}
        {loading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400">
            {t('dash.loading')}
          </div>
        ) : catalogItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {catalogItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-5 transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{t('dash.live')}</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#172D46] transition line-clamp-2">
                    {item.name}
                  </h3>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <div className="text-sm font-bold text-slate-400">
                      {t('dash.priceLabel')}
                    </div>
                    <div className="text-base font-extrabold text-slate-900 tabular-nums flex items-baseline gap-1">
                      <span>Rp {item.price.toLocaleString('id-ID')}</span>
                      <span className="text-sm text-slate-500 font-normal">{roleMeta.priceUnit}</span>
                    </div>
                  </div>

                  {/* Specs List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-sm font-bold text-slate-500">{t('dash.specsLabel')}</div>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {item.specs.slice(0, 3).map((spec, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span />
                  {canEdit && (
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center gap-1 font-bold text-sm"
                    title={t('dash.deleteTitle')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('dash.delete')}</span>
                  </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <RoleIcon aria-hidden="true" className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-display text-xl font-extrabold text-brand-ink">{t('dash.emptyTitle')}</h3>
            <p className="text-base text-slate-600 mt-2 max-w-sm mx-auto">
              {canEdit ? t('dash.emptyCatalog') : t('dash.emptyOther')}
            </p>
            {canEdit && <button
              onClick={() => setShowAddModal(true)}
              className="mt-5 inline-flex min-h-11 items-center gap-2 px-6 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold text-sm transition"
            >
              <Plus aria-hidden="true" className="w-4 h-4" />
              <span>{roleMeta.addBtnLabel}</span>
            </button>}
          </div>
        )}
      </div>

      {/* Modal: Tambah Dagangan / Paket Katalog Baru */}
      {showAddModal && (
        <Dialog onClose={() => setShowAddModal(false)} label={t('dash.dialogLabel')}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-item-title" className="bg-white rounded-lg max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 id="add-item-title" className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink">{roleMeta.addBtnLabel}</h3>
                <p className="text-sm text-slate-600">{t('dash.modalNote')}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition"
                aria-label={t('dash.close')}
              >
                <X aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="add-name" className="text-sm font-semibold text-slate-800">{t('dash.fName')}</label>
                <input
                  id="add-name"
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={
                    role === 'VENDOR'
                      ? t('dash.phVendor')
                      : role === 'TALENT'
                      ? t('dash.phTalent')
                      : role === 'TENANT'
                      ? 'Misal: Paket Combo Kopi Artisan + Pastry'
                      : 'Nama paket dagangan atau proyek'
                  }
                  className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="add-category" className="text-sm font-semibold text-slate-800">{t('dash.fCategory')}</label>
                  {role === 'VENDOR' ? (
                    <select
                      id="add-category"
                      value={newItemCategory || 'SOUND'}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                    >
                      <option value="SOUND">{t('dash.catSound')}</option>
                      <option value="STAGE">{t('dash.catStage')}</option>
                      <option value="LIGHTING">{t('dash.catLighting')}</option>
                      <option value="TENT">{t('dash.catTent')}</option>
                    </select>
                  ) : (
                  <input
                    id="add-category"
                    type="text"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    placeholder={t('dash.phGenre')}
                    className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                  />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="add-price" className="text-sm font-semibold text-slate-800">{t('dash.fPrice')}</label>
                  <input
                    id="add-price"
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="Misal: 25000000"
                    className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base tabular-nums text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="add-specs" className="text-sm font-semibold text-slate-800">
                  {t('dash.fSpecs')}
                </label>
                <textarea
                  id="add-specs"
                  rows={4}
                  value={newItemSpecs}
                  onChange={(e) => setNewItemSpecs(e.target.value)}
                  placeholder={t('dash.phSpecs')}
                  className="py-3 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-12 px-6 rounded-full border-2 border-brand-navy/25 hover:border-brand-navy text-base font-semibold text-brand-ink transition"
                >
                  {t('dash.cancel')}
                </button>
                <button
                  type="submit"
                  className="min-h-12 px-7 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold text-base transition-colors"
                >
                  {t('dash.save')}
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      )}
    </div>
  );
}
