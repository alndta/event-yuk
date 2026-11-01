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

    triggerToast(`"${newItem.name}" berhasil ditambahkan ke katalog dagangan kamu.`);

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
    if (confirm(`Yakin mau menghapus "${name}" dari katalogmu?`)) {
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
          title: 'Ruang kerja vendor produksi',
          subtitle: 'Kelola paket alat panggung, sound system, rigging, dan pantau pencairan termin Escrow Midtrans.',
          icon: Sliders,
          themeColor: 'text-brand-navy bg-brand-lime-soft border-brand-navy/15',
          badgeText: 'Vendor produksi terverifikasi',
          catalogLabel: 'Paket alat dan rigging',
          addBtnLabel: 'Tambah paket alat produksi',
          priceUnit: '/ hari sewa',
        };
      case 'TALENT':
        return {
          title: 'Ruang kerja band dan musisi',
          subtitle: 'Kelola paket manggung live, riders teknis, riders konsumsi, dan kepastian honor terkunci di Escrow.',
          icon: Music,
          themeColor: 'text-brand-navy bg-brand-lime-soft border-brand-navy/15',
          badgeText: 'Musisi dan manajemen band resmi',
          catalogLabel: 'Paket penampilan manggung',
          addBtnLabel: 'Tambah paket tampil',
          priceUnit: '/ sesi penampilan',
        };
      case 'TENANT':
        return {
          title: 'Ruang kerja tenant bazaar',
          subtitle: 'Kelola menu andalan, produk retail, dan pantau status kurasi kaveling booth dari Event Organizer.',
          icon: Store,
          themeColor: 'text-brand-navy bg-brand-lime-soft border-brand-navy/15',
          badgeText: 'Tenant kuliner dan pameran',
          catalogLabel: 'Menu dan produk dagangan',
          addBtnLabel: 'Tambah menu atau produk',
          priceUnit: '/ porsi atau item',
        };
      case 'EO':
        return {
          title: 'Ruang kerja event organizer',
          subtitle: 'Kelola pagu anggaran acara, plot denah kaveling booth tenant, dan rekrut puluhan shift kru harian.',
          icon: Calendar,
          themeColor: 'text-brand-navy bg-brand-lime-soft border-brand-navy/15',
          badgeText: 'Event organizer dan promotor',
          catalogLabel: 'Proyek acara aktif',
          addBtnLabel: 'Buat proyek acara',
          priceUnit: 'Pagu anggaran',
        };
      case 'SPONSOR':
        return {
          title: 'Ruang kerja sponsor brand',
          subtitle: 'Kelola alokasi sponsorship acara, tinjau impresi audiens riil, dan amankan hak aktivasi stan lapangan.',
          icon: Building2,
          themeColor: 'text-brand-navy bg-brand-lime-soft border-brand-navy/15',
          badgeText: 'Mitra sponsor brand korporasi',
          catalogLabel: 'Paket sponsorship dan stan aktivasi',
          addBtnLabel: 'Ajukan paket kemitraan',
          priceUnit: 'Nilai sponsorship',
        };
      case 'CREW':
        return {
          title: 'Ruang kerja kru lapangan',
          subtitle: 'Kelola keahlian lapangan, rate honor harian, dan pantau jadwal presensi scan QR geofencing GPS.',
          icon: Users,
          themeColor: 'text-brand-navy bg-brand-lime-soft border-brand-navy/15',
          badgeText: 'Kru harian acara',
          catalogLabel: 'Kualifikasi peran dan shift',
          addBtnLabel: 'Tambah kualifikasi shift',
          priceUnit: '/ shift harian',
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
                <span>1 akun, 1 peran tetap</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-brand-forest-light text-brand-forest-dark">
                <CheckCircle2 aria-hidden="true" className="w-4 h-4" />
                <span>e-KYC terverifikasi</span>
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-brand-ink truncate">
              {user?.businessName || user?.fullName || 'Mitra Event Yuk'}
            </h1>
            <p className="text-sm text-slate-500">
              {user?.email} • {user?.cityRegion || 'Jakarta Selatan'} • Terdaftar resmi
            </p>
          </div>
        </div>

        {/* Shortcut Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/profile"
            className="inline-flex min-h-11 items-center px-5 rounded-full border-2 border-brand-navy/25 hover:border-brand-navy text-sm font-semibold text-brand-ink transition"
          >
            Pengaturan akun dan bank
          </Link>
          <Link
            to="/contracts"
            className="inline-flex min-h-11 items-center gap-2 px-5 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white text-sm font-semibold transition"
          >
            <FileText aria-hidden="true" className="w-4 h-4" />
            <span>Kontrak PKS digital</span>
          </Link>
        </div>
      </div>

      {/* 2. Escrow & Wallet Summary Strip */}
      <div className="bg-brand-navy rounded-lg p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime text-brand-navy text-sm font-semibold mb-2">
              <ShieldCheck aria-hidden="true" className="w-4 h-4" />
              <span>Rekening bersama Escrow berlisensi Bank Indonesia</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
              Posisi keuangan dan pembayaran acaramu
            </h2>
          </div>

          <Link
            to="/profile"
            className="inline-flex min-h-11 items-center gap-2 px-5 rounded-full border-2 border-white/40 hover:border-white text-white text-sm font-semibold transition self-start sm:self-auto"
          >
            <span>Tarik saldo ke rekening bank</span>
            <ExternalLink aria-hidden="true" className="w-4 h-4 text-brand-lime" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          <div className="bg-brand-navy-dark p-5 sm:p-6 rounded-lg">
            <div className="text-sm text-slate-300 font-medium flex items-center gap-2 mb-1">
              <Lock aria-hidden="true" className="w-4 h-4 text-brand-lime" />
              <span>Dana tertahan di escrow (kontrak berjalan)</span>
            </div>
            <div className="font-display text-3xl font-extrabold tracking-[-0.03em] text-white tabular-nums mt-2">
              Rp {wallet.escrow_locked.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-slate-300 mt-2">Cair otomatis setelah BAST digital disetujui</div>
          </div>

          <div className="bg-brand-navy-dark p-5 sm:p-6 rounded-lg">
            <div className="text-sm text-slate-300 font-medium flex items-center gap-2 mb-1">
              <DollarSign aria-hidden="true" className="w-4 h-4 text-brand-lime" />
              <span>Saldo siap tarik</span>
            </div>
            <div className="font-display text-3xl font-extrabold tracking-[-0.03em] text-brand-lime tabular-nums mt-2">
              Rp {wallet.available_bal.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-slate-300 mt-2">Bisa ditarik instan ke BCA, Mandiri, atau GoPay</div>
          </div>

          <div className="bg-brand-navy-dark p-5 sm:p-6 rounded-lg">
            <div className="text-sm text-slate-300 font-medium flex items-center gap-2 mb-1">
              <ShieldCheck aria-hidden="true" className="w-4 h-4 text-brand-lime" />
              <span>Proteksi transaksi PKS</span>
            </div>
            <div className="font-display text-xl font-extrabold text-white mt-2">
              Midtrans Escrow Gateway
            </div>
            <div className="text-sm text-slate-300 mt-2">Termin DP 50% dan pelunasan diikat klausul hukum resmi</div>
          </div>
        </div>
      </div>

      {/* 3. Core Feature: Manajemen Katalog & Dagangan */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border mb-2 ${roleMeta.themeColor}`}>
              <Layers className="w-3.5 h-3.5" />
              <span>Produk dan dagangan aktif</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-brand-ink">
              {roleMeta.catalogLabel}
            </h2>
            <p className="text-base text-slate-600 mt-1">
              Kelola paket penawaran yang tampil di katalog publik dan bisa dipesan mitra.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 px-6 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold text-base transition"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
            <span>{roleMeta.addBtnLabel}</span>
          </button>
        </div>

        {/* Catalog Items Grid */}
        {loading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400">
            Memuat katalogmu...
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
                      <span>Aktif di katalog</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#172D46] transition line-clamp-2">
                    {item.name}
                  </h3>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <div className="text-sm font-bold text-slate-400">
                      Harga penawaran
                    </div>
                    <div className="text-base font-extrabold text-slate-900 tabular-nums flex items-baseline gap-1">
                      <span>Rp {item.price.toLocaleString('id-ID')}</span>
                      <span className="text-sm text-slate-500 font-normal">{roleMeta.priceUnit}</span>
                    </div>
                  </div>

                  {/* Specs List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-sm font-bold text-slate-500">Spesifikasi dan keunggulan</div>
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
                  <span className="text-sm text-slate-400">Garansi PKS resmi</span>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center gap-1 font-bold text-sm"
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
          <div className="bg-white rounded-lg p-12 text-center">
            <RoleIcon aria-hidden="true" className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-display text-xl font-extrabold text-brand-ink">Katalogmu masih kosong</h3>
            <p className="text-base text-slate-600 mt-2 max-w-sm mx-auto">
              Tambahkan paket pertamamu supaya mitra bisa menemukanmu di Event Yuk.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-5 inline-flex min-h-11 items-center gap-2 px-6 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold text-sm transition"
            >
              <Plus aria-hidden="true" className="w-4 h-4" />
              <span>{roleMeta.addBtnLabel}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal: Tambah Dagangan / Paket Katalog Baru */}
      {showAddModal && (
        <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-fadeIn">
          <div role="dialog" aria-modal="true" aria-labelledby="add-item-title" className="bg-white rounded-lg max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 id="add-item-title" className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink">{roleMeta.addBtnLabel}</h3>
                <p className="text-sm text-slate-600">Item ini langsung tampil di katalog publik dan terhubung ke SPK kontrak.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition"
                aria-label="Tutup"
              >
                <X aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="add-name" className="text-sm font-semibold text-slate-800">Nama paket atau produk dagangan *</label>
                <input
                  id="add-name"
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
                  className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="add-category" className="text-sm font-semibold text-slate-800">Kategori</label>
                  <input
                    id="add-category"
                    type="text"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    placeholder="Misal: Sound System, F&B, dsb."
                    className="min-h-12 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="add-price" className="text-sm font-semibold text-slate-800">Harga penawaran (Rp) *</label>
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
                  Spesifikasi teknis atau rincian layanan (satu baris per poin)
                </label>
                <textarea
                  id="add-specs"
                  rows={4}
                  value={newItemSpecs}
                  onChange={(e) => setNewItemSpecs(e.target.value)}
                  placeholder={`- Spesifikasi unit pertama\n- Keunggulan teknis kedua\n- Operator sound / kelengkapan riders`}
                  className="py-3 w-full px-4 rounded-lg border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-12 px-6 rounded-full border-2 border-brand-navy/25 hover:border-brand-navy text-base font-semibold text-brand-ink transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-12 px-7 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold text-base transition-colors"
                >
                  Simpan ke katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
