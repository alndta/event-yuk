import { useState, useEffect } from 'react';
import {
  FileCheck,
  ShieldCheck,
  Clock,
  Handshake,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  MessageSquare,
  FileText,
  Paperclip,
} from 'lucide-react';
import ContractModal from '../components/ContractModal';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';

export interface ContractProposalItem {
  id: string;
  contractNumber: string;
  partyOne: string; // EO
  partyTwo: string; // Vendor / Band / Sponsor / Tenant
  roleType: 'VENDOR' | 'TALENT' | 'TENANT' | 'SPONSOR';
  eventTitle: string;
  totalAmount: number;
  dpPercentage: number;
  scopeOfWork: string;
  date: string;
  status: 'SUBMITTED' | 'COUNTER_OFFER' | 'CONTRACT_SIGNED' | 'ESCROW_FUNDED' | 'REJECTED';
  counterAmount?: number;
  counterDpPercentage?: number;
  counterNotes?: string;
  lastUpdatedBy?: string;
  attachedFileName?: string | null;
  attachedFileSize?: string | null;
  contractDocumentUrl?: string | null;
}

export const initialProposalsData: ContractProposalItem[] = [
  {
    id: 'cnt-1',
    contractNumber: 'PKS/EY/2026/089124',
    partyOne: 'Nusantara Live Kreasi (EO)',
    partyTwo: 'Nusantara Audio & Rigging Pro',
    roleType: 'VENDOR',
    eventTitle: 'Soundfest Archipelago 2027: Indie Waves',
    totalAmount: 65000000,
    dpPercentage: 50,
    scopeOfWork: 'Penyediaan Line Array 40.000 Watt, Rigging 12x10m, dan 100kVA Genset.',
    date: '26 Oktober 2026',
    status: 'ESCROW_FUNDED',
    lastUpdatedBy: 'Sistem Escrow Midtrans',
    attachedFileName: 'PKS_Audio_Rigging_Nusantara.pdf',
    attachedFileSize: '2.8 MB',
  },
  {
    id: 'cnt-2',
    contractNumber: 'PKS/EY/2026/091402',
    partyOne: 'OSIS SMA Labschool Rawamangun (EO)',
    partyTwo: 'Senja Di Batavia (Indie Rock Band)',
    roleType: 'TALENT',
    eventTitle: 'Pensi Labschool: RETROSPEKTA 2027',
    totalAmount: 35000000,
    dpPercentage: 50,
    scopeOfWork: 'Penampilan panggung live 45 menit sebagai Guest Star Utama + Meet & Greet.',
    date: '26 Oktober 2026',
    status: 'CONTRACT_SIGNED',
    lastUpdatedBy: 'Reza (Manajer Band)',
    attachedFileName: 'Kontrak_Penampilan_SenjaDiBatavia.docx',
    attachedFileSize: '1.4 MB',
  },
  {
    id: 'cnt-3',
    contractNumber: 'PKS/EY/2026/092551',
    partyOne: 'Kolektif Ruang Rasa (EO)',
    partyTwo: 'Luminary Stage & Visual FX',
    roleType: 'VENDOR',
    eventTitle: 'Urban Coffee & Craft Bazaar Vol. 5',
    totalAmount: 32000000,
    dpPercentage: 40,
    scopeOfWork: 'Instalasi Videotron LED P3.9 6x4m dan 16 Moving Head Beam.',
    date: '26 Oktober 2026',
    status: 'COUNTER_OFFER',
    counterAmount: 28000000,
    counterDpPercentage: 50,
    counterNotes: 'Pihak EO mengajukan penyesuaian anggaran ke Rp 28.000.000 dengan skema 50:50 (DP 50% saat loading alat, 50% setelah BAST penutupan acara).',
    lastUpdatedBy: 'Kolektif Ruang Rasa (EO)',
  },
  {
    id: 'cnt-4',
    contractNumber: 'PKS/EY/2026/093880',
    partyOne: 'Nusantara Live Kreasi (EO)',
    partyTwo: 'Teh Segar Nusantara (Brand FMCG)',
    roleType: 'SPONSOR',
    eventTitle: 'Soundfest Archipelago 2027: Indie Waves',
    totalAmount: 175000000,
    dpPercentage: 70,
    scopeOfWork: 'Platinum Sponsorship Package: Hak booth sampling 6x6m, branding LED panggung dan 15 VIP passes.',
    date: '26 Oktober 2026',
    status: 'SUBMITTED',
    lastUpdatedBy: 'Teh Segar Nusantara',
  },
];

interface Props {
  onShowToast?: (msg: string) => void;
}

export default function ContractsPage({ onShowToast }: Props) {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<ContractProposalItem[]>(initialProposalsData);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedForPks, setSelectedForPks] = useState<ContractProposalItem | null>(null);
  const [isPksModalOpen, setIsPksModalOpen] = useState(false);

  // Counter-offer modal
  const [counterTarget, setCounterTarget] = useState<ContractProposalItem | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterDp, setCounterDp] = useState<number>(50);
  const [counterNotes, setCounterNotes] = useState<string>('');

  const fetchLiveProposals = () => {
    fetch('/api/v1/proposals')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const mapped: ContractProposalItem[] = resData.data.map((p: any) => ({
            id: p.id,
            contractNumber:
              p.contract_pks_number ||
              `PKS/EY/${new Date(p.created_at).getFullYear()}/${p.id.slice(0, 6).toUpperCase()}`,
            partyOne: p.sender?.full_name || 'Nusantara Live Kreasi (EO)',
            partyTwo: p.receiver?.full_name || `${p.proposal_type} Mitra`,
            roleType: p.proposal_type || 'VENDOR',
            eventTitle: p.event?.title || p.title || 'Soundfest Archipelago 2027',
            totalAmount: Number(p.deal_price || p.offered_price || 0),
            dpPercentage: Number(p.dp_percentage || 50),
            scopeOfWork: p.scope_of_work || 'Pengadaan teknis & penampilan panggung acara.',
            date: new Date(p.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            status: p.status || 'SUBMITTED',
            counterAmount: p.counter_price ? Number(p.counter_price) : undefined,
            counterDpPercentage: p.counter_dp_percentage ? Number(p.counter_dp_percentage) : undefined,
            counterNotes: p.counter_notes || undefined,
            lastUpdatedBy: p.last_action_by ? 'Mitra Terverifikasi' : undefined,
            attachedFileName: p.attached_file_name || null,
            attachedFileSize: p.attached_file_size || null,
            contractDocumentUrl: p.contract_document_url || null,
          }));
          setProposals(mapped);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLiveProposals();
  }, []);

  const filtered = proposals.filter((item) => {
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch =
      item.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partyOne.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partyTwo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Action handlers
  const handleOpenCounterModal = (item: ContractProposalItem) => {
    setCounterTarget(item);
    setCounterPrice(item.counterAmount || item.totalAmount);
    setCounterDp(item.counterDpPercentage || item.dpPercentage || 50);
    setCounterNotes(item.counterNotes || '');
  };

  const handleSubmitCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterTarget) return;

    try {
      await fetch(`/api/v1/proposals/${counterTarget.id}/counter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counter_price: counterPrice,
          counter_dp_percentage: counterDp,
          counter_notes: counterNotes,
          user_id: user?.id,
        }),
      });
    } catch {}

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === counterTarget.id) {
          return {
            ...p,
            status: 'COUNTER_OFFER',
            counterAmount: counterPrice,
            counterDpPercentage: counterDp,
            counterNotes: counterNotes,
            lastUpdatedBy: 'Kamu (Pengajuan Perubahan)',
          };
        }
        return p;
      })
    );

    setCounterTarget(null);
    if (onShowToast) {
      onShowToast('Perubahan penawaran (Counter-Offer) berhasil dikirim ke mitra.');
    }
  };

  const handleApproveProposal = async (item: ContractProposalItem) => {
    const finalAmount = item.counterAmount || item.totalAmount;
    const finalDp = item.counterDpPercentage || item.dpPercentage;

    try {
      await fetch(`/api/v1/proposals/${item.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACCEPT',
          user_id: user?.id,
        }),
      });
    } catch {}

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === item.id) {
          return {
            ...p,
            status: 'CONTRACT_SIGNED',
            totalAmount: finalAmount,
            dpPercentage: finalDp,
            counterNotes: undefined,
            lastUpdatedBy: 'Disepakati oleh Kedua Pihak',
          };
        }
        return p;
      })
    );

    if (onShowToast) {
      onShowToast(`Kesepakatan disetujui! Dokumen PKS resmi diterbitkan untuk ${item.eventTitle}.`);
    }
  };

  const handleRejectProposal = async (item: ContractProposalItem) => {
    try {
      await fetch(`/api/v1/proposals/${item.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          user_id: user?.id,
        }),
      });
    } catch {}

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === item.id) {
          return {
            ...p,
            status: 'REJECTED',
            lastUpdatedBy: 'Ditolak',
          };
        }
        return p;
      })
    );

    if (onShowToast) {
      onShowToast(`Penawaran untuk ${item.partyTwo} ditolak.`);
    }
  };

  const handleOpenPks = (item: ContractProposalItem) => {
    setSelectedForPks(item);
    setIsPksModalOpen(true);
  };

  const handleSignAndFund = async () => {
    if (!selectedForPks) return;

    try {
      await fetch(`/api/v1/proposals/${selectedForPks.id}/fund-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payer_id: user?.id,
        }),
      });
    } catch {}

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === selectedForPks.id) {
          return {
            ...p,
            status: 'ESCROW_FUNDED',
            lastUpdatedBy: 'Midtrans Escrow Paid',
          };
        }
        return p;
      })
    );

    setIsPksModalOpen(false);
    if (onShowToast) {
      onShowToast('Pembayaran DP Escrow via Midtrans berhasil diverifikasi! Dana terkunci aman.');
    }
  };

  const getStatusBadge = (status: ContractProposalItem['status']) => {
    switch (status) {
      case 'ESCROW_FUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-brand-forest-light text-brand-forest-dark">
            <ShieldCheck aria-hidden="true" className="w-4 h-4" />
            <span>Escrow terproteksi</span>
          </span>
        );
      case 'CONTRACT_SIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-brand-lime text-brand-navy">
            <FileCheck aria-hidden="true" className="w-4 h-4" />
            <span>PKS disepakati (siap bayar)</span>
          </span>
        );
      case 'COUNTER_OFFER':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-900">
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            <span>Negosiasi ulang (counter)</span>
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-brand-clay text-brand-ink">
            <Clock aria-hidden="true" className="w-4 h-4" />
            <span>Menunggu respons awal</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-rose-100 text-rose-900">
            <XCircle aria-hidden="true" className="w-4 h-4" />
            <span>Penawaran ditolak</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title="Surat Perjanjian Kerjasama (PKS) & Escrow | Event Yuk"
        description="Kelola draf negosiasi kontrak PKS digital, termin pembayaran, dan proteksi Rekening Bersama Escrow Midtrans."
        noIndex={true}
      />
      {/* Header */}
      <div className="max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-lime-strong">
          <Handshake aria-hidden="true" className="h-4 w-4" />
          Ruang negosiasi dan kontrak PKS digital
        </p>
        <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-brand-ink sm:text-6xl">
          Kelola penawaran, kesepakatan, dan PKS
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Ajukan tawaran, sesuaikan harga lewat counter-offer, pilih skema termin (70:30 atau 50:50), lalu kunci dananya di rekening bersama Escrow.
        </p>

        {/* Search */}
        <div className="mt-5 relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            aria-label="Cari kontrak"
            placeholder="Cari nomor PKS, nama acara, vendor, band, atau sponsor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-14 w-full rounded-full border border-slate-300 bg-white pl-12 pr-5 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200">
        {[
          { id: 'ALL', label: 'Semua status' },
          { id: 'SUBMITTED', label: 'Pengajuan baru' },
          { id: 'COUNTER_OFFER', label: 'Negosiasi ulang (counter)' },
          { id: 'CONTRACT_SIGNED', label: 'Disepakati (PKS siap)' },
          { id: 'ESCROW_FUNDED', label: 'Escrow aktif' },
          { id: 'REJECTED', label: 'Ditolak' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            aria-pressed={filterStatus === tab.id}
            className={`min-h-11 rounded-full border-2 px-5 text-sm font-semibold transition whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
              filterStatus === tab.id
                ? 'border-brand-navy bg-brand-navy text-white'
                : 'border-brand-navy/25 text-brand-ink hover:border-brand-navy'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="font-extrabold text-slate-800 text-sm">Tidak ada proposal yang sesuai filter</div>
            <p className="text-sm text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau ubah tab status filter.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const hasCounter = item.status === 'COUNTER_OFFER' && item.counterAmount;
            const currentPrice = hasCounter ? item.counterAmount! : item.totalAmount;
            const currentDpRatio = hasCounter ? item.counterDpPercentage! : item.dpPercentage;
            const currentSettlementRatio = 100 - currentDpRatio;
            const dpRupiah = (currentPrice * currentDpRatio) / 100;
            const settlementRupiah = currentPrice - dpRupiah;

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg p-6 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tabular-nums text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {item.contractNumber}
                    </span>
                    {getStatusBadge(item.status)}
                    <span className="text-sm text-slate-400">• Diperbarui oleh: {item.lastUpdatedBy}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      {item.eventTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mt-1">
                      <span className="font-bold text-slate-900">{item.partyOne}</span>
                      <span>—</span>
                      <span className="font-semibold text-slate-800">{item.partyTwo}</span>
                      <span className="px-2 py-0.5 rounded text-sm font-bold bg-slate-100 text-slate-700">
                        {item.roleType}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <strong className="text-slate-800">Lingkup kerja:</strong> {item.scopeOfWork}
                  </p>

                  {/* Custom Attached Contract File */}
                  {item.attachedFileName && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-300 text-amber-950 text-sm">
                      <Paperclip className="w-3.5 h-3.5 text-[#5E7628] shrink-0" />
                      <span className="font-semibold text-slate-700">Berkas PKS mandiri:</span>
                      <span className="font-bold text-slate-900 truncate">{item.attachedFileName}</span>
                      <span className="text-slate-500 tabular-nums text-sm shrink-0">({item.attachedFileSize || 'File'})</span>
                    </div>
                  )}

                  {/* Counter Notes Display */}
                  {item.counterNotes && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-900">
                      <div className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Catatan negosiasi ulang:</span>
                      </div>
                      <p>{item.counterNotes}</p>
                    </div>
                  )}

                  {/* Financial & Payment Scheme Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-brand-cream rounded-lg">
                      <div className="text-sm font-medium text-slate-600">Total kesepakatan</div>
                      <div className="text-sm sm:text-sm font-extrabold text-slate-900 tabular-nums mt-0.5">
                        Rp {currentPrice.toLocaleString('id-ID')}
                      </div>
                      {hasCounter && (
                        <div className="text-sm text-slate-600 line-through">
                          Rp {item.totalAmount.toLocaleString('id-ID')}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-brand-cream rounded-lg">
                      <div className="text-sm font-medium text-slate-600">Skema termin</div>
                      <div className="text-sm font-extrabold text-[#172D46] mt-0.5">
                        {currentDpRatio} : {currentSettlementRatio}
                      </div>
                      <div className="text-sm text-slate-500">DP : Pelunasan BAST</div>
                    </div>

                    <div className="p-3 bg-brand-cream rounded-lg">
                      <div className="text-sm font-medium text-slate-600">Nominal DP ({currentDpRatio}%)</div>
                      <div className="text-sm font-extrabold text-brand-forest-dark tabular-nums mt-0.5">
                        Rp {dpRupiah.toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm text-slate-500">Escrow awal</div>
                    </div>

                    <div className="p-3 bg-brand-cream rounded-lg">
                      <div className="text-sm font-medium text-slate-600">Pelunasan ({currentSettlementRatio}%)</div>
                      <div className="text-sm font-extrabold text-slate-700 tabular-nums mt-0.5">
                        Rp {settlementRupiah.toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm text-slate-500">Setelah BAST</div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex md:flex-col items-center justify-end gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* If in SUBMITTED or COUNTER_OFFER: can Approve, Counter, or Reject */}
                  {(item.status === 'SUBMITTED' || item.status === 'COUNTER_OFFER') && (
                    <>
                      <button
                        onClick={() => handleApproveProposal(item)}
                        className="w-full min-h-12 px-5 rounded-full text-sm font-semibold bg-brand-navy hover:bg-brand-navy-dark text-white flex items-center justify-center gap-2 transition-colors"
                      >
                        <CheckCircle2 aria-hidden="true" className="w-5 h-5 text-brand-lime" />
                        <span>Setujui kesepakatan</span>
                      </button>

                      <button
                        onClick={() => handleOpenCounterModal(item)}
                        className="w-full min-h-12 px-5 rounded-full text-sm font-semibold border-2 border-brand-navy/30 hover:border-brand-navy text-brand-ink flex items-center justify-center gap-2 transition-colors"
                      >
                        <RotateCcw aria-hidden="true" className="w-5 h-5" />
                        <span>Ajukan perubahan (counter)</span>
                      </button>

                      <button
                        onClick={() => handleRejectProposal(item)}
                        className="w-full min-h-12 px-5 rounded-full text-sm font-semibold text-rose-700 hover:bg-rose-50 border-2 border-rose-200 transition-colors"
                      >
                        <span>Tolak penawaran</span>
                      </button>
                    </>
                  )}

                  {/* If CONTRACT_SIGNED: can view PKS and Pay Escrow */}
                  {item.status === 'CONTRACT_SIGNED' && (
                    <button
                      onClick={() => handleOpenPks(item)}
                      className="w-full min-h-12 px-5 rounded-full text-sm font-semibold bg-brand-navy hover:bg-brand-navy-dark text-white flex items-center justify-center gap-2 transition-colors"
                    >
                      <FileCheck aria-hidden="true" className="w-5 h-5 text-brand-lime" />
                      <span>Buka PKS dan bayar DP escrow</span>
                    </button>
                  )}

                  {/* If ESCROW_FUNDED: can view active contract */}
                  {item.status === 'ESCROW_FUNDED' && (
                    <button
                      onClick={() => handleOpenPks(item)}
                      className="w-full min-h-12 px-5 rounded-full text-sm font-semibold bg-brand-navy hover:bg-brand-navy-dark text-white flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShieldCheck aria-hidden="true" className="w-5 h-5 text-brand-lime" />
                      <span>Lihat dokumen PKS aktif</span>
                    </button>
                  )}

                  {item.status === 'REJECTED' && (
                    <div className="text-sm text-rose-800 font-semibold px-4 py-2 bg-rose-50 rounded-full">
                      Penawaran dibatalkan
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Counter-Offer Negotiation Modal */}
      {counterTarget && (
        <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-lg max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-sm tabular-nums text-slate-500 font-semibold">{counterTarget.contractNumber}</span>
                <h3 className="font-extrabold text-slate-900 text-base">Ajukan Perubahan (Counter-Offer)</h3>
              </div>
              <button
                onClick={() => setCounterTarget(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmitCounter} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Nominal Penawaran Baru (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 tabular-nums font-bold text-sm focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Skema termin Pembayaran Bersama (DP : Pelunasan BAST)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { dp: 50, label: '50 : 50', desc: 'Standar' },
                    { dp: 70, label: '70 : 30', desc: 'Prioritas Produksi' },
                    { dp: 30, label: '30 : 70', desc: 'Garansi Pelunasan' },
                  ].map((ratio) => (
                    <button
                      key={ratio.dp}
                      type="button"
                      onClick={() => setCounterDp(ratio.dp)}
                      className={`p-2.5 rounded-lg border text-center transition ${
                        counterDp === ratio.dp
                          ? 'border-[#172D46] bg-[#172D46]/10 font-bold text-[#172D46]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-sm font-extrabold">{ratio.label}</div>
                      <div className="text-sm text-slate-400">{ratio.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  DP {counterDp}% disetor ke Escrow saat kontrak ditandatangani, dan sisa {100 - counterDp}% dicairkan setelah Berita Acara Serah Terima (BAST) digital disetujui.
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Alasan Penyesuaian & Catatan Teknis
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan penyesuaian yang diajukan (misal: pengurangan unit speaker, penambahan durasi tampil band, dll)..."
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCounterTarget(null)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#172D46] hover:bg-[#163a50] text-white flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kirim Counter-Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official PKS Digital Document Modal */}
      {selectedForPks && (
        <ContractModal
          isOpen={isPksModalOpen}
          contractData={selectedForPks}
          onClose={() => setIsPksModalOpen(false)}
          onSignAndFund={handleSignAndFund}
        />
      )}
    </div>
  );
}
