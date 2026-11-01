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
import { UserRole } from '../components/RoleOnboardingModal';
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
  const role: UserRole = user?.activeRole || 'VENDOR';

  const [wallet, setWallet] = useState<{ escrow_locked: number; available_bal: number }>({
    escrow_locked: 28500000,
    available_bal: 14250000,
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

  // Initial dummy or fetched catalog depending on role
  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/users/catalog/my-catalog?user_id=${user?.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.catalogItems) && data.catalogItems.length > 0) {
          const formatted = data.catalogItems.map((p: any) => ({
            id: p.id,
            name: p.package_name || p.title || p.brand_name || 'Paket Dagangan',
            category: p.category || p.event_category || 'PRODUKSI',
            price: Number(p.base_price || p.rental_price || p.total_budget || 25000000),
            specs: Array.isArray(p.tech_specs)
              ? p.tech_specs
              : typeof p.tech_specs === 'string'
              ? [p.tech_specs]
              : ['Spesifikasi Sesuai Kontrak PKS'],
            quota: p.daily_quota || 1,
            status: 'ACTIVE' as const,
          }));
          setCatalogItems(formatted);
        } else {
          // Provide high-quality role defaults so user has tangible items to manage
          if (role === 'VENDOR') {
            setCatalogItems([
              {
                id: 'pkg-1',
                name: 'Paket Main Stage Line Array 15.000 Watt',
                category: 'Sound System',
                price: 35000000,
                specs: ['12 Box Line Array Dual 10 Inch', '4 Subwoofer Dual 18 Inch', 'Digital Console Allen & Heath dLive 32ch'],
                quota: 2,
                status: 'ACTIVE',
              },
              {
                id: 'pkg-2',
                name: 'Paket Panggung Rigging Aluminium 12 x 10 Meter',
                category: 'Rigging & Stage',
                price: 28000000,
                specs: ['Bahan Aluminium Truss Heavy Duty', 'Level Panggung Tinggi 1.5m', 'Cover Tenda Atap Transparan'],
                quota: 1,
                status: 'ACTIVE',
              },
              {
                id: 'pkg-3',
                name: 'Videotron LED Screen Outdoor P3.9 (6 x 4m)',
                category: 'Visual & LED',
                price: 24000000,
                specs: ['Pitch 3.9mm High Refresh Rate', 'Processor Video Novastar 4K', 'Konstruksi Hanging Truss'],
                quota: 2,
                status: 'ACTIVE',
              },
            ]);
          } else if (role === 'TALENT') {
            setCatalogItems([
              {
                id: 'tlt-1',
                name: 'Paket Live Performance Full Band Festival (60 Menit)',
                category: 'Live Band Concert',
                price: 45000000,
                specs: ['Durasi 60 Menit (8-10 Lagu)', 'Termasuk FOH Sound Engineer Resmi Band', 'Riders Teknis: Wireless Shure GLX-D & In-Ear Monitor'],
                status: 'ACTIVE',
              },
              {
                id: 'tlt-2',
                name: 'Paket Intimate Acoustic Session (45 Menit)',
                category: 'Acoustic / Intimate Show',
                price: 25000000,
                specs: ['Format Akustik Semi-Elektris', 'Durasi 45 Menit', 'Cocok untuk Pameran & Showcase Kampus'],
                status: 'ACTIVE',
              },
            ]);
          } else if (role === 'TENANT') {
            setCatalogItems([
              {
                id: 'tnt-1',
                name: 'Signature Cold Brew & Espresso Mocktail Series',
                category: 'Food & Beverage',
                price: 35000,
                specs: ['Kapasitas Saji 500 Cup/Hari', 'Peralatan Mesin Espresso La Marzocco Mini', 'Listrik Standar 1.500 Watt'],
                status: 'ACTIVE',
              },
              {
                id: 'tnt-2',
                name: 'Artisan Korean Fried Chicken Rice Bowl',
                category: 'Food & Beverage',
                price: 48000,
                specs: ['Deep Fryer Listrik Higienis', 'Sertifikasi Halal & Bahan Baku Segar', 'Estimasi Transaksi Cepat < 3 Menit/Porsi'],
                status: 'ACTIVE',
              },
            ]);
          } else if (role === 'EO') {
            setCatalogItems([
              {
                id: 'eo-1',
                name: 'Soundfest Archipelago 2027 (Kaveling Booth & Vendor)',
                category: 'Festival Musik Terbuka',
                price: 1850000000,
                specs: ['Target 25.000 Pengunjung', '40 Kaveling Booth Kuliner F&B', 'Pengadaan Sound 40.000W & 3 Stage'],
                status: 'ACTIVE',
              },
            ]);
          } else if (role === 'SPONSOR') {
            setCatalogItems([
              {
                id: 'spn-1',
                name: 'Hak Penamaan Stage Utama & Stan Eksklusif 8x8m',
                category: 'Platinum Sponsorship',
                price: 150000000,
                specs: ['Eksklusivitas Kategori Industri Minuman', 'Logo di Seluruh Materi Promosi & LED Screen', 'Sampling Produk Langsung ke 25.000 Penonton'],
                status: 'ACTIVE',
              },
            ]);
          } else if (role === 'CREW') {
            setCatalogItems([
              {
                id: 'crw-1',
                name: 'Liaison Officer (LO) Artis & Manajemen Hospitality',
                category: 'Talent Management',
                price: 450000,
                specs: ['Berpengalaman Menangani Artis Nasional', 'Fasih Berbahasa Inggris & Koordinasi Riders', 'Siap Kerja Shift Pagi-Malam'],
                status: 'ACTIVE',
              },
            ]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch user wallet
    fetch('/api/v1/users/wallet', {
      headers: { 'x-user-id': user?.id || '' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.wallet) {
          setWallet({
            escrow_locked: Number(data.wallet.escrow_locked) || 28500000,
            available_bal: Number(data.wallet.available_bal) || 14250000,
          });
        }
      })
      .catch(() => {});
  }, [role, user?.id]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

    const newItem: CatalogItem = {
      id: 'item-' + Date.now(),
      name: newItemName,
      category: newItemCategory || 'Paket Utama',
      price: Number(newItemPrice),
      specs: newItemSpecs
        ? newItemSpecs.split('\n').filter((s) => s.trim().length > 0)
        : ['Spesifikasi Teknis Sesuai Perjanjian Kerjasama'],
      quota: 1,
      status: 'ACTIVE',
    };

    setCatalogItems([newItem, ...catalogItems]);
    setShowAddModal(false);
    setNewItemName('');
    setNewItemCategory('');
    setNewItemPrice('');
    setNewItemSpecs('');

    triggerToast(`"${newItem.name}" berhasil ditambahkan ke katalog dagangan Anda.`);

    // Sync to backend
    fetch('/api/v1/users/catalog/item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user?.id || '',
      },
      body: JSON.stringify({
        package_name: newItem.name,
        category: newItem.category,
        base_price: newItem.price,
        daily_quota: 1,
        tech_specs: newItem.specs,
      }),
    }).catch(() => {});
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus "${name}" dari katalog Anda?`)) {
      setCatalogItems(catalogItems.filter((item) => item.id !== id));
      triggerToast(`"${name}" telah dihapus dari katalog.`);

      fetch(`/api/v1/users/catalog/item/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    }
  };

  const getRoleHeaderInfo = () => {
    switch (role) {
      case 'VENDOR':
        return {
          title: 'Ruang Kerja & Katalog Vendor Produksi',
          subtitle: 'Kelola paket alat panggung, sound system, rigging, dan pantau pencairan termin Escrow Midtrans.',
          icon: Sliders,
          themeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
          badgeText: 'Vendor Produksi Terverifikasi',
          catalogLabel: 'Katalog Paket Alat & Rigging',
          addBtnLabel: '+ Tambah Paket Alat Produksi',
          priceUnit: '/ Hari Sewa',
        };
      case 'TALENT':
        return {
          title: 'Ruang Kerja & Rate Card Band Musik',
          subtitle: 'Kelola paket manggung live, riders teknis, riders konsumsi, dan kepastian honor terkunci di Escrow.',
          icon: Music,
          themeColor: 'text-purple-700 bg-purple-50 border-purple-200',
          badgeText: 'Musisi & Manajemen Band Resmi',
          catalogLabel: 'Katalog Paket Penampilan Manggung',
          addBtnLabel: '+ Tambah Paket Tampil Baru',
          priceUnit: '/ Sesi Penampilan',
        };
      case 'TENANT':
        return {
          title: 'Ruang Kerja & Produk Tenant Bazaar',
          subtitle: 'Kelola menu andalan, produk retail, dan pantau status kurasi kaveling booth dari Event Organizer.',
          icon: Store,
          themeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          badgeText: 'Tenant Kuliner & Pameran',
          catalogLabel: 'Katalog Menu & Produk Dagangan',
          addBtnLabel: '+ Tambah Menu / Produk Baru',
          priceUnit: '/ Porsi / Item',
        };
      case 'EO':
        return {
          title: 'Ruang Kerja & Proyek Acara Event Organizer',
          subtitle: 'Kelola pagu anggaran acara, plot denah kaveling booth tenant, dan rekrut puluhan shift kru harian.',
          icon: Calendar,
          themeColor: 'text-[#172D46] bg-[#172D46]/10 border-[#172D46]/20',
          badgeText: 'Event Organizer & Promotor',
          catalogLabel: 'Katalog Proyek Acara Aktif',
          addBtnLabel: '+ Buat Proyek Acara Baru',
          priceUnit: 'Pagu Anggaran',
        };
      case 'SPONSOR':
        return {
          title: 'Ruang Kerja & Portofolio Sponsorship Brand',
          subtitle: 'Kelola alokasi sponsorship acara, tinjau impresi audiens riil, dan amankan hak aktivasi stan lapangan.',
          icon: Building2,
          themeColor: 'text-amber-800 bg-amber-50 border-amber-200',
          badgeText: 'Mitra Sponsor Brand Korporasi',
          catalogLabel: 'Paket Sponsorship & Stan Aktivasi',
          addBtnLabel: '+ Ajukan Paket Kemitraan Baru',
          priceUnit: 'Nilai Sponsorship',
        };
      case 'CREW':
        return {
          title: 'Ruang Kerja & Kualifikasi Shift Kru Lapangan',
          subtitle: 'Kelola keahlian lapangan, rate honor harian, dan pantau jadwal presensi scan QR geofencing GPS.',
          icon: Users,
          themeColor: 'text-rose-700 bg-rose-50 border-rose-200',
          badgeText: 'Event Crew & Kru Harian',
          catalogLabel: 'Kualifikasi Peran Shift Lapangan',
          addBtnLabel: '+ Tambah Kualifikasi Shift Baru',
          priceUnit: '/ Shift Harian',
        };
    }
  };

  const roleMeta = getRoleHeaderInfo();
  const RoleIcon = roleMeta.icon;

  if (loading && catalogItems.length === 0) {
    return (
      <div className="space-y-8 font-sans">
        <SEOHead
          title="Ruang Kerja & Dashboard Mitra | Event Yuk"
          description="Ruang kerja kolaborasi transaksi, katalog dagangan, dan kontrak hukum PKS resmi."
          noIndex={true}
        />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <SEOHead
        title="Ruang Kerja & Dashboard Mitra | Event Yuk"
        description="Ruang kerja kolaborasi transaksi, katalog dagangan, dan kontrak hukum PKS resmi."
        noIndex={true}
      />
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172D46] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Header Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#172D46] to-[#5E7628] p-0.5 shrink-0 shadow-md">
            <img
              src={user?.avatarUrl || '/assets/crew-production.jpg'}
              alt={user?.fullName || 'User'}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleMeta.themeColor}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{roleMeta.badgeText}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>1 Akun = 1 Peran Tetap</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>e-KYC Terverifikasi</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
              {user?.businessName || user?.fullName || 'Mitra Event Yuk'}
            </h1>
            <p className="text-xs text-slate-500">
              {user?.email} • {user?.cityRegion || 'Jakarta Selatan'} • Terdaftar Resmi
            </p>
          </div>
        </div>

        {/* Shortcut Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
          >
            Pengaturan Akun & Bank
          </Link>
          <Link
            to="/contracts"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Kontrak PKS Digital</span>
          </Link>
        </div>
      </div>

      {/* 2. Escrow & Wallet Summary Strip */}
      <div className="bg-gradient-to-r from-[#172D46] via-[#1B3B56] to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#5E7628] text-xs font-bold mb-1 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rekening Bersama Escrow Berlisensi Bank Indonesia</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Posisi Keuangan & Pembayaran Acara Anda
            </h2>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition self-start sm:self-auto"
          >
            <span>Tarik Saldo ke Rekening Bank</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#5E7628]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-coral-400" />
              <span>Dana Tertahan di Escrow (Kontrak Berjalan)</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              Rp {wallet.escrow_locked.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-amber-300 mt-1">Cair otomatis setelah BAST digital disetujui</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saldo Siap Tarik (Available Balance)</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
              Rp {wallet.available_bal.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-emerald-300 mt-1">Bebas ditarik instan ke BCA / Mandiri / GoPay</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Proteksi Transaksi PKS</span>
            </div>
            <div className="text-sm font-black text-white mt-1">
              Midtrans Escrow Gateway
            </div>
            <div className="text-[10px] text-slate-300 mt-1">Termin DP 50% & pelunasan diikat klausul hukum resmi</div>
          </div>
        </div>
      </div>

      {/* 3. Core Feature: Manajemen Katalog & Dagangan */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-2 ${roleMeta.themeColor}`}>
              <Layers className="w-3.5 h-3.5" />
              <span>Manajemen Produk & Dagangan Aktif</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {roleMeta.catalogLabel}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Di sinilah Anda mengelola paket penawaran yang dipajang di katalog publik dan siap dipesan pihak rekanan.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#456B39] to-[#5E7628] hover:from-[#2F5232] hover:to-[#3F531D] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#456B39]/25 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{roleMeta.addBtnLabel}</span>
          </button>
        </div>

        {/* Catalog Items Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">
            Memuat katalog dagangan Anda...
          </div>
        ) : catalogItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {catalogItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Aktif di Katalog</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#172D46] transition line-clamp-2">
                    {item.name}
                  </h3>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Harga Penawaran:
                    </div>
                    <div className="text-base font-black text-slate-900 font-mono flex items-baseline gap-1">
                      <span>Rp {item.price.toLocaleString('id-ID')}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{roleMeta.priceUnit}</span>
                    </div>
                  </div>

                  {/* Specs List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-slate-500">Spesifikasi & Keunggulan:</div>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {item.specs.slice(0, 3).map((spec, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Garansi PKS Resmi</span>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 font-bold text-[11px]"
                    title="Hapus item dari katalog"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <RoleIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-800 text-sm">Belum Ada Item di Katalog Anda</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tambahkan paket dagangan pertama Anda agar dapat ditemukan oleh mitra kolaborasi di ekosistem Event Yuk.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#172D46] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{roleMeta.addBtnLabel}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal: Tambah Dagangan / Paket Katalog Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">{roleMeta.addBtnLabel}</h3>
                <p className="text-xs text-slate-500">Item ini akan langsung tampil di katalog publik dan terhubung ke SPK kontrak.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Paket / Produk Dagangan *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={
                    role === 'VENDOR'
                      ? 'Misal: Paket Line Array Dual 12 Inch + Subwoofer'
                      : role === 'TALENT'
                      ? 'Misal: Paket Full Live Band Show 60 Menit'
                      : role === 'TENANT'
                      ? 'Misal: Paket Combo Kopi Artisan + Pastry'
                      : 'Nama paket dagangan atau proyek'
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kategori</label>
                  <input
                    type="text"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    placeholder="Misal: Sound System, F&B, dsb."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Harga Penawaran (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="Misal: 25000000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Spesifikasi Teknis / Rincian Layanan (1 baris per poin)
                </label>
                <textarea
                  rows={4}
                  value={newItemSpecs}
                  onChange={(e) => setNewItemSpecs(e.target.value)}
                  placeholder={`- Spesifikasi unit pertama\n- Keunggulan teknis kedua\n- Operator sound / kelengkapan riders`}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#456B39] to-[#5E7628] hover:from-[#2F5232] hover:to-[#3F531D] text-white font-bold text-xs shadow-md transition"
                >
                  Simpan ke Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
