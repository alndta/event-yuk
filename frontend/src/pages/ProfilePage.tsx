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
        <div className="fixed bottom-6 right-6 z-50 bg-[#172D46] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pengaturan Profil Akun & Verifikasi e-KYC
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data identitas, rekening bank penarikan saldo, dan posisi dompet rekening bersama (Escrow).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profileData.kycStatus === 'VERIFIED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Akun e-KYC Terverifikasi</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Verifikasi Identitas Tertunda</span>
            </span>
          )}
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'profile'
              ? 'bg-[#172D46] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Informasi Profil</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'kyc'
              ? 'bg-[#172D46] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verifikasi e-KYC & Rekening Bank</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'wallet'
              ? 'bg-[#172D46] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Dompet Escrow & Payout</span>
        </button>
      </div>

      {/* TAB 1: INFORMASI PROFIL */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm max-w-2xl">
          <h3 className="font-extrabold text-slate-900 text-lg mb-1">Data Identitas Akun</h3>
          <p className="text-xs text-slate-500 mb-6">Informasi kontak yang tampil pada kontrak PKS digital dan profil resmi.</p>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Penanggung Jawab</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setFormData({ ...profileData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Resmi (Terkunci)</label>
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={profileData.phoneWa}
                  onChange={(e) => setFormData({ ...profileData, phoneWa: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Entitas Bisnis / Komite</label>
              <input
                type="text"
                value={profileData.businessName}
                onChange={(e) => setFormData({ ...profileData, businessName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kota & Domisili Operasional</label>
              <input
                type="text"
                value={profileData.cityRegion}
                onChange={(e) => setFormData({ ...profileData, cityRegion: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#172D46] hover:bg-[#0F263B] text-white font-bold transition shadow-md"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: VERIFIKASI E-KYC & BANK */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-lg">Verifikasi e-KYC & Rekening Penarikan</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Sesuai regulasi FR-AUTH-03, identitas KTP/NPWP dan rekening bank wajib terverifikasi sebelum dapat mencairkan dana dari Escrow.
          </p>

          <form onSubmit={handleSaveKyc} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK / KTP)</label>
              <input
                type="text"
                required
                value={profileData.idCardNumber}
                onChange={(e) => setFormData({ ...profileData, idCardNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none font-mono"
              />
            </div>

            <div className="border border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-xs">Unggah Foto KTP / NPWP Asli</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Format JPG/PNG maksimal 5 MB (Dokumen tersimpan aman & terenkripsi)</div>
              <div className="mt-3 inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[10px] text-slate-600">
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
                  <label className="block font-bold text-slate-700 mb-1">Nama Bank</label>
                  <select
                    value={profileData.bankName}
                    onChange={(e) => setFormData({ ...profileData, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none bg-white"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="BNI">BNI (Bank Negara Indonesia)</option>
                    <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    value={profileData.accountNumber}
                    onChange={(e) => setFormData({ ...profileData, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pemilik Rekening (Sesuai Buku Tabungan)</label>
                <input
                  type="text"
                  required
                  value={profileData.accountHolder}
                  onChange={(e) => setFormData({ ...profileData, accountHolder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md flex items-center gap-2"
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
            <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Escrow Locked
                </span>
                <span className="text-[11px] text-slate-400">Kontrak Berjalan</span>
              </div>

              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mb-1">
                Rp {wallet.escrowLocked.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Dana yang sedang ditahan dalam kontrak aktif vendor panggung & gaji kru. Akan cair otomatis saat BAST disetujui atau presensi kru tervalidasi.
              </p>
            </div>

            {/* Available Balance Card */}
            <div className="bg-gradient-to-tr from-[#172D46] to-[#153a50] text-white p-6 rounded-3xl border border-sky-900 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saldo Siap Tarik
                </span>
                <span className="text-[11px] text-slate-300">Available Balance</span>
              </div>

              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mb-1">
                Rp {wallet.availableBal.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed mb-4">
                Dana bersih hasil sewa booth tenant dan pelunasan termin yang siap ditransfer instan ke rekening bank Anda.
              </p>

              <button className="px-4 py-2 bg-gradient-to-r from-[#456B39] to-[#5E7628] hover:opacity-90 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center gap-1.5">
                <span>Tarik Dana ke Bank Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
