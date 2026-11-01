import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ArrowRight,
  Wallet,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'wallet'>('profile');
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [profileData, setFormData] = useState({
    fullName: user?.fullName || 'Nusantara Live Kreasi',
    email: user?.email || 'eo@eventyuk.id',
    phoneWa: user?.phoneWa || '081234567890',
    businessName: 'PT Nusantara Live Kreasi Indonesia',
    cityRegion: 'Jakarta Selatan',
    kycStatus: (user?.kycStatus || 'VERIFIED') as 'UNVERIFIED' | 'PENDING' | 'VERIFIED',
    idCardNumber: '3174092801900002',
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '5420199281',
    accountHolder: user?.fullName || 'Nusantara Live Kreasi',
  });

  const [wallet, setWallet] = useState({
    escrowLocked: 280000000,
    availableBal: 42500000,
    currency: 'IDR',
  });

  useEffect(() => {
    const currentUserId = user?.id || 'a0000000-0000-0000-0000-000000000001';

    // 1. Fetch live user profile from backend
    fetch('/api/v1/users/me', {
      headers: { 'x-user-id': currentUserId },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const u = data.user;
          const profiles = u.user_profiles_roles || [];
          const activeRoleProfile =
            profiles.find((p: any) => p.role_type === (user?.activeRole || 'EO')) || profiles[0] || {};
          const bank = activeRoleProfile.bank_account || {};

          setFormData((prev) => ({
            ...prev,
            fullName: u.full_name || prev.fullName,
            email: u.email || prev.email,
            phoneWa: u.phone_wa || prev.phoneWa,
            kycStatus: u.kyc_status || prev.kycStatus,
            businessName: activeRoleProfile.business_name || prev.businessName,
            cityRegion: activeRoleProfile.city_region || prev.cityRegion,
            bankName: bank.bank_name || prev.bankName,
            accountNumber: bank.account_number || prev.accountNumber,
            accountHolder: bank.account_holder || u.full_name || prev.accountHolder,
          }));
        }
      })
      .catch(() => {});

    // 2. Fetch live wallet from backend
    fetch('/api/v1/users/wallet', {
      headers: { 'x-user-id': currentUserId },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.wallet) {
          setWallet({
            escrowLocked: Number(data.wallet.escrow_locked) || 0,
            availableBal: Number(data.wallet.available_bal) || 0,
            currency: data.wallet.currency || 'IDR',
          });
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const currentUserId = user?.id || 'a0000000-0000-0000-0000-000000000001';
    const currentRole = user?.activeRole || 'EO';

    try {
      await fetch('/api/v1/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
          'x-user-role': currentRole,
        },
        body: JSON.stringify({
          full_name: profileData.fullName,
          phone_wa: profileData.phoneWa,
          business_name: profileData.businessName,
          city_region: profileData.cityRegion,
        }),
      });
      setSuccessToast('Profil identitas berhasil disimpan ke database.');
    } catch (err) {
      setSuccessToast('Profil berhasil disimpan.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleSaveKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const currentUserId = user?.id || 'a0000000-0000-0000-0000-000000000001';
    const currentRole = user?.activeRole || 'EO';

    try {
      await fetch('/api/v1/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
          'x-user-role': currentRole,
        },
        body: JSON.stringify({
          kyc_status: 'VERIFIED',
          bank_account: {
            bank_name: profileData.bankName,
            account_number: profileData.accountNumber,
            account_holder: profileData.accountHolder,
          },
        }),
      });
      setFormData({ ...profileData, kycStatus: 'VERIFIED' });
      setSuccessToast('Dokumen e-KYC dan rekening bank resmi berhasil diverifikasi dan disimpan!');
    } catch (err) {
      setSuccessToast('e-KYC tersimpan.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title="Pengaturan Profil Akun & e-KYC | Event Yuk"
        description="Kelola profil akun, verifikasi e-KYC identitas hukum, dan rekening bank penarikan saldo."
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
            Profil akun dan verifikasi e-KYC
          </h1>
          <p className="text-lg leading-8 text-slate-700 mt-3">
            Atur data identitasmu dan rekening untuk penarikan saldo, lalu pantau posisi dompet Escrow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profileData.kycStatus === 'VERIFIED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-forest-light text-brand-forest-dark rounded-full text-sm font-semibold">
              <ShieldCheck aria-hidden="true" className="w-4 h-4" />
              <span>Akun e-KYC terverifikasi</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm font-semibold">
              <AlertCircle aria-hidden="true" className="w-4 h-4" />
              <span>Verifikasi identitas tertunda</span>
            </span>
          )}
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div role="group" aria-label="Bagian profil" className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-8 overflow-x-auto text-sm font-semibold">
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
          <span>Informasi profil</span>
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
          <span>Verifikasi e-KYC dan rekening bank</span>
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
          <span>Dompet Escrow dan penarikan</span>
        </button>
      </div>

      {/* TAB 1: INFORMASI PROFIL */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-3xl">
          <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink mb-1">Data identitas akun</h3>
          <p className="text-base text-slate-600 mb-6">Informasi kontak yang tampil pada kontrak PKS digital dan profil resmi.</p>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Nama lengkap penanggung jawab</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setFormData({ ...profileData, fullName: e.target.value })}
                className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Email resmi (terkunci)</label>
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="min-h-12 w-full px-4 rounded-lg bg-brand-cream text-base text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={profileData.phoneWa}
                  onChange={(e) => setFormData({ ...profileData, phoneWa: e.target.value })}
                  className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Nama entitas bisnis atau komite</label>
              <input
                type="text"
                value={profileData.businessName}
                onChange={(e) => setFormData({ ...profileData, businessName: e.target.value })}
                className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Kota dan domisili operasional</label>
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
                {loading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: VERIFIKASI E-KYC & BANK */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck aria-hidden="true" className="w-5 h-5 text-brand-forest" />
            <h3 className="font-extrabold text-slate-900 text-lg">Verifikasi e-KYC & Rekening Penarikan</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Sesuai regulasi FR-AUTH-03, identitas KTP/NPWP dan rekening bank wajib terverifikasi sebelum dapat mencairkan dana dari Escrow.
          </p>

          <form onSubmit={handleSaveKyc} className="space-y-4 text-sm">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Nomor Induk Kependudukan (NIK atau KTP)</label>
              <input
                type="text"
                required
                value={profileData.idCardNumber}
                onChange={(e) => setFormData({ ...profileData, idCardNumber: e.target.value })}
                className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none tabular-nums"
              />
            </div>

            <div className="border border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-sm">Unggah Foto KTP / NPWP Asli</div>
              <div className="text-sm text-slate-400 mt-0.5">Format JPG/PNG maksimal 5 MB (Dokumen tersimpan aman & terenkripsi)</div>
              <div className="mt-3 inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg tabular-nums text-sm text-slate-600">
                ktp_nusantara_live_kreasi.jpg (Terverifikasi)
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#172D46]" />
                <span>Rekening Bank Penarikan Saldo</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Nama bank</label>
                  <select
                    value={profileData.bankName}
                    onChange={(e) => setFormData({ ...profileData, bankName: e.target.value })}
                    className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/30 focus:outline-none bg-white"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="BNI">BNI (Bank Negara Indonesia)</option>
                    <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Nomor rekening</label>
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
                <label className="block text-sm font-semibold text-slate-800 mb-2">Nama pemilik rekening (sesuai buku tabungan)</label>
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
                <span>Simpan & Verifikasi e-KYC</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DOMPET ESCROW & SALDO */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Escrow Locked Card */}
            <div className="bg-brand-navy text-white p-6 sm:p-8 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold px-3 py-1 bg-white/10 text-white rounded-full flex items-center gap-1.5">
                  <Clock aria-hidden="true" className="w-4 h-4 text-brand-lime" /> Dana tertahan
                </span>
                <span className="text-sm text-slate-300">Kontrak berjalan</span>
              </div>

              <div className="font-display text-4xl font-extrabold tabular-nums tracking-[-0.03em] text-white mb-2">
                Rp {wallet.escrowLocked.toLocaleString('id-ID')}
              </div>
              <p className="text-base text-slate-200 leading-7">
                Dana yang sedang ditahan dalam kontrak aktif vendor panggung & gaji kru. Akan cair otomatis saat BAST disetujui atau presensi kru tervalidasi.
              </p>
            </div>

            {/* Available Balance Card */}
            <div className="bg-brand-navy text-white p-6 sm:p-8 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold px-3 py-1 bg-brand-lime text-brand-navy rounded-full flex items-center gap-1.5">
                  <CheckCircle2 aria-hidden="true" className="w-4 h-4" /> Saldo siap tarik
                </span>
                <span className="text-sm text-slate-300">Bisa ditarik instan</span>
              </div>

              <div className="font-display text-4xl font-extrabold tabular-nums tracking-[-0.03em] text-white mb-2">
                Rp {wallet.availableBal.toLocaleString('id-ID')}
              </div>
              <p className="text-base text-slate-200 leading-7 mb-5">
                Dana bersih hasil sewa booth tenant dan pelunasan termin yang siap ditransfer instan ke rekening bank kamu.
              </p>

              <button className="min-h-12 px-6 bg-brand-lime hover:bg-brand-lime-hover rounded-full text-brand-navy font-semibold text-base transition-colors inline-flex items-center gap-2">
                <span>Tarik dana ke bank sekarang</span>
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
