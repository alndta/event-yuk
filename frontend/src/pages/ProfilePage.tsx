import React, { useState, useEffect, useRef } from 'react';
import useEnter from '../hooks/useEnter';
import {
  User,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Clock,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';
import { api, ApiError, uploadImage } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'wallet'>('profile');
  const pageRef = useRef<HTMLDivElement>(null);
  useEnter(pageRef, activeTab);
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [profileData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneWa: user?.phoneWa || '',
    businessName: user?.businessName || '',
    cityRegion: user?.cityRegion || '',
    kycStatus: (user?.kycStatus || 'UNVERIFIED') as 'UNVERIFIED' | 'PENDING' | 'VERIFIED',
    idCardNumber: '',
    bankName: 'BCA',
    accountNumber: '',
    accountHolder: user?.fullName || '',
  });
  const [kycRejectReason, setKycRejectReason] = useState<string | null>(null);
  const [docs, setDocs] = useState({ ktp: false, selfie: false });
  const [uploadingKind, setUploadingKind] = useState<'KTP' | 'SELFIE' | null>(null);
  const [previews, setPreviews] = useState<{ ktp?: string; selfie?: string }>({});

  const [wallet, setWallet] = useState({ escrowLocked: 0, availableBal: 0, currency: 'IDR' });

  useEffect(() => {
    if (!user) return;

    api('/users/me')
      .then((data) => {
        const u = data.user;
        const bank = u.bank_account || {};
        setFormData((prev) => ({
          ...prev,
          fullName: u.full_name || prev.fullName,
          email: u.email || prev.email,
          phoneWa: u.phone_wa || '',
          kycStatus: u.kyc_status || prev.kycStatus,
          businessName: u.business_name || '',
          cityRegion: u.city_region || '',
          bankName: bank.bank_code || prev.bankName,
          accountNumber: bank.account_number || '',
          accountHolder: bank.account_holder || u.full_name || prev.accountHolder,
        }));
      })
      .catch(() => {});

    api('/users/kyc')
      .then((data) => {
        setKycRejectReason(data.kyc?.reject_reason || null);
        setDocs({ ktp: Boolean(data.kyc?.documents?.ktp), selfie: Boolean(data.kyc?.documents?.selfie) });
      })
      .catch(() => {});

    api('/payments/wallet')
      .then((data) =>
        setWallet({
          escrowLocked: Number(data.wallet.escrow_locked) || 0,
          availableBal: Number(data.wallet.available_bal) || 0,
          currency: data.wallet.currency || 'IDR',
        })
      )
      .catch(() => {});
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/users/profile', {
        method: 'PATCH',
        body: {
          full_name: profileData.fullName,
          phone_wa: profileData.phoneWa || undefined,
          business_name: profileData.businessName || undefined,
          city_region: profileData.cityRegion || undefined,
        },
      });
      setSuccessToast(t('prof.savedOk'));
    } catch (err) {
      setSuccessToast(err instanceof ApiError ? err.message : t('prof.savedFail'));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  // The photo goes to private storage; the page keeps only a local preview, never a public link.
  const handlePhoto = async (kind: 'KTP' | 'SELFIE', file: File | undefined) => {
    if (!file) return;
    setUploadingKind(kind);
    try {
      await uploadImage(`/users/kyc/documents?kind=${kind}`, file);
      const key = kind === 'KTP' ? 'ktp' : 'selfie';
      setDocs((d) => ({ ...d, [key]: true }));
      setPreviews((p) => ({ ...p, [key]: URL.createObjectURL(file) }));
    } catch (err) {
      setSuccessToast(err instanceof ApiError ? err.message : t('kyc.uploadFail'));
      setTimeout(() => setSuccessToast(null), 4500);
    } finally {
      setUploadingKind(null);
    }
  };

  // Submitting only asks for review. An administrator makes the decision; the account cannot verify itself.
  const handleSaveKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docs.ktp || !docs.selfie) {
      setSuccessToast(t('kyc.needPhotos'));
      setTimeout(() => setSuccessToast(null), 4000);
      return;
    }
    setLoading(true);
    try {
      await api('/users/kyc', {
        method: 'POST',
        body: {
          nik: profileData.idCardNumber,
          bank_account: { bank_code: profileData.bankName, account_number: profileData.accountNumber, account_holder: profileData.accountHolder },
        },
      });
      setFormData({ ...profileData, idCardNumber: '', kycStatus: 'PENDING' });
      setKycRejectReason(null);
      setSuccessToast(t('kyc.sent'));
    } catch (err) {
      setSuccessToast(err instanceof ApiError ? err.message : t('kyc.sentFail'));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessToast(null), 4500);
    }
  };

  return (
    <div ref={pageRef} className="max-w-5xl mx-auto space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title={t('prof.seoTitle')}
        description={t('prof.seoDesc')}
        noIndex={true}
      />
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172D46] text-white px-5 py-3 rounded-lg flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-brand-ink">
            {t('prof.title')}
          </h1>
          <p className="text-lg leading-8 text-slate-700 mt-3">
            {t('prof.lead')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profileData.kycStatus === 'VERIFIED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-forest-light text-brand-forest-dark rounded-full text-sm font-semibold">
              <ShieldCheck aria-hidden="true" className="w-4 h-4" />
              <span>{t('prof.badgeOk')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm font-semibold">
              <AlertCircle aria-hidden="true" className="w-4 h-4" />
              <span>{profileData.kycStatus === 'PENDING' ? t('prof.badgePending') : t('prof.badgeNone')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div role="group" aria-label={t('prof.tabsLabel')} className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-8 overflow-x-auto text-sm font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          aria-pressed={activeTab === 'profile'}
          className={`flex min-h-11 shrink-0 items-center gap-2 px-5 rounded-full border-2 transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-brand-navy bg-brand-navy text-white'
              : 'border-brand-navy/25 text-brand-ink hover:border-brand-navy'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t('prof.tabProfile')}</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          aria-pressed={activeTab === 'kyc'}
          className={`flex min-h-11 shrink-0 items-center gap-2 px-5 rounded-full border-2 transition whitespace-nowrap ${
            activeTab === 'kyc'
              ? 'border-brand-navy bg-brand-navy text-white'
              : 'border-brand-navy/25 text-brand-ink hover:border-brand-navy'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t('prof.tabKyc')}</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          aria-pressed={activeTab === 'wallet'}
          className={`flex min-h-11 shrink-0 items-center gap-2 px-5 rounded-full border-2 transition whitespace-nowrap ${
            activeTab === 'wallet'
              ? 'border-brand-navy bg-brand-navy text-white'
              : 'border-brand-navy/25 text-brand-ink hover:border-brand-navy'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t('prof.tabWallet')}</span>
        </button>
      </div>

      {/* TAB 1: INFORMASI PROFIL */}
      {activeTab === 'profile' && (
        <div data-enter className="bg-white rounded-lg p-6 sm:p-8 max-w-3xl">
          <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink mb-1">{t('prof.idTitle')}</h3>
          <p className="text-base text-slate-600 mb-6">{t('prof.idLead')}</p>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">{t('prof.fullName')}</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setFormData({ ...profileData, fullName: e.target.value })}
                className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">{t('prof.email')}</label>
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="min-h-12 w-full px-4 rounded-lg bg-brand-cream text-base text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">{t('prof.phone')}</label>
                <input
                  type="tel"
                  value={profileData.phoneWa}
                  onChange={(e) => setFormData({ ...profileData, phoneWa: e.target.value })}
                  className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">{t('prof.business')}</label>
              <input
                type="text"
                value={profileData.businessName}
                onChange={(e) => setFormData({ ...profileData, businessName: e.target.value })}
                className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">{t('prof.city')}</label>
              <input
                type="text"
                value={profileData.cityRegion}
                onChange={(e) => setFormData({ ...profileData, cityRegion: e.target.value })}
                className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="min-h-12 px-7 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold transition-colors"
              >
                {loading ? t('prof.saving') : t('prof.saveProfile')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: VERIFIKASI E-KYC & BANK */}
      {activeTab === 'kyc' && (
        <div data-enter className="bg-white rounded-lg p-6 sm:p-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck aria-hidden="true" className="w-5 h-5 text-brand-forest" />
            <h3 className="font-extrabold text-slate-900 text-lg">{t('kyc.title')}</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            {t('kyc.lead')}
          </p>

          {profileData.kycStatus === 'VERIFIED' && (
            <p role="status" className="rounded-lg bg-brand-forest-light px-4 py-3 text-sm font-semibold text-brand-forest-dark">{t('kyc.verified')}</p>
          )}
          {profileData.kycStatus === 'PENDING' && (
            <p role="status" className="rounded-lg bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900">{t('kyc.pending')}</p>
          )}
          {kycRejectReason && profileData.kycStatus === 'UNVERIFIED' && (
            <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{t('kyc.rejected')} {kycRejectReason}. {t('kyc.fixAndResend')}</p>
          )}

          {profileData.kycStatus === 'UNVERIFIED' && (
          <form onSubmit={handleSaveKyc} className="space-y-4 text-sm">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">{t('kyc.nik')}</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{16}"
                maxLength={16}
                title={t('kyc.nikHint')}
                required
                value={profileData.idCardNumber}
                onChange={(e) => setFormData({ ...profileData, idCardNumber: e.target.value })}
                className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none tabular-nums"
              />
            </div>

            <p className="rounded-lg bg-brand-sand px-4 py-3 text-sm text-slate-700">
              {t('kyc.privacy')}
            </p>


            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
                <ShieldCheck aria-hidden="true" className="w-4 h-4 text-brand-navy" />
                <span>{t('kyc.photos')}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { kind: 'KTP', key: 'ktp', label: t('kyc.ktp'), hint: t('kyc.ktpHint') },
                  { kind: 'SELFIE', key: 'selfie', label: t('kyc.selfie'), hint: t('kyc.selfieHint') },
                ] as const).map(({ kind, key, label, hint }) => (
                  <label key={kind} className="flex cursor-pointer flex-col gap-2 rounded-lg border-2 border-dashed border-slate-300 p-4 text-center hover:border-brand-navy focus-within:border-brand-navy">
                    <span className="text-sm font-semibold text-slate-800">{label}</span>
                    {previews[key] ? (
                      <img src={previews[key]} alt="" className="mx-auto h-28 w-full rounded-md object-cover" />
                    ) : (
                      <UploadCloud aria-hidden="true" className="mx-auto h-8 w-8 text-slate-400" />
                    )}
                    <span className="text-xs text-slate-500">{hint}</span>
                    <span className={`text-sm font-semibold ${docs[key] ? 'text-brand-forest' : 'text-brand-navy'}`}>
                      {uploadingKind === kind ? t('kyc.uploading') : docs[key] ? t('kyc.uploaded') + ' · ' + t('kyc.replace') : t('kyc.choose')}
                    </span>
                    <span className="text-xs text-slate-500">{t('kyc.formats')}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="sr-only"
                      disabled={uploadingKind !== null}
                      onChange={(e) => { void handlePhoto(kind, e.target.files?.[0]); e.target.value = ''; }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#172D46]" />
                <span>{t('kyc.bankTitle')}</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">{t('kyc.bank')}</label>
                  <select
                    value={profileData.bankName}
                    onChange={(e) => setFormData({ ...profileData, bankName: e.target.value })}
                    className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none bg-white"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="MANDIRI">Bank Mandiri</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="BNI">BNI (Bank Negara Indonesia)</option>
                    <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">{t('kyc.account')}</label>
                  <input
                    type="text"
                    required
                    value={profileData.accountNumber}
                    onChange={(e) => setFormData({ ...profileData, accountNumber: e.target.value })}
                    className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">{t('kyc.holder')}</label>
                <input
                  type="text"
                  required
                  value={profileData.accountHolder}
                  onChange={(e) => setFormData({ ...profileData, accountHolder: e.target.value })}
                  className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="min-h-12 px-7 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('kyc.submit')}</span>
              </button>
            </div>
          </form>
          )}
        </div>
      )}

      {/* TAB 3: DOMPET ESCROW & SALDO */}
      {activeTab === 'wallet' && (
        <div data-enter className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Escrow Locked Card */}
            <div className="bg-brand-navy text-white p-6 sm:p-8 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold px-3 py-1 bg-white/10 text-white rounded-full flex items-center gap-1.5">
                  <Clock aria-hidden="true" className="w-4 h-4 text-brand-lime" /> {t('wal.held')}
                </span>
                <span className="text-sm text-slate-300">{t('wal.heldTag')}</span>
              </div>

              <div className="font-display text-4xl font-extrabold tabular-nums tracking-[-0.03em] text-white mb-2">
                Rp {wallet.escrowLocked.toLocaleString('id-ID')}
              </div>
              <p className="text-base text-slate-200 leading-7">
                {t('wal.heldBody')}
              </p>
            </div>

            {/* Available Balance Card */}
            <div className="bg-brand-navy text-white p-6 sm:p-8 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold px-3 py-1 bg-brand-lime text-brand-navy rounded-full flex items-center gap-1.5">
                  <CheckCircle2 aria-hidden="true" className="w-4 h-4" /> {t('wal.available')}
                </span>
                <span className="text-sm text-slate-300">{t('wal.availableTag')}</span>
              </div>

              <div className="font-display text-4xl font-extrabold tabular-nums tracking-[-0.03em] text-white mb-2">
                Rp {wallet.availableBal.toLocaleString('id-ID')}
              </div>
              <p className="text-base text-slate-200 leading-7 mb-5">
                {t('wal.availableBody')}
              </p>

              <button
                type="button"
                disabled
                className="min-h-12 px-6 bg-brand-lime/70 rounded-full text-brand-navy font-semibold text-base inline-flex items-center gap-2 cursor-not-allowed"
              >
                <span>{t('wal.withdraw')}</span>
              </button>
              <p className="mt-3 text-sm text-slate-300">{t('wal.withdrawNote')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
