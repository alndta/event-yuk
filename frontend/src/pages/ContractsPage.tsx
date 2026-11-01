import Dialog from '../components/Dialog';
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
import { useLanguage } from '../context/LanguageContext';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/Spinner';
import { api, ApiError } from '../lib/api';
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
  /** True when the other party acted last, so this user may counter or accept. */
  myTurn?: boolean;
  attachedFileName?: string | null;
  attachedFileSize?: string | null;
  contractDocumentUrl?: string | null;
}

interface Props {
  onShowToast?: (msg: string) => void;
}

export default function ContractsPage({ onShowToast }: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [proposals, setProposals] = useState<ContractProposalItem[]>([]);
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

  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  const fetchLiveProposals = () => {
    api('/proposals')
      .then((resData) => {
        const myId = user?.id;
        const mapped: ContractProposalItem[] = (resData.data || []).map((p: any) => ({
          id: p.id,
          contractNumber: p.contract_pks_number || `PKS/EY/${new Date(p.created_at).getFullYear()}/${p.id.slice(0, 6).toUpperCase()}`,
          partyOne: p.sender?.full_name || 'Pengirim',
          partyTwo: p.receiver?.full_name || 'Penerima',
          roleType: p.proposal_type,
          eventTitle: p.event?.title || p.title,
          totalAmount: Number(p.deal_price || p.offered_price || 0),
          dpPercentage: Number(p.dp_percentage || 50),
          scopeOfWork: p.scope_of_work || '',
          date: new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          status: p.status,
          counterAmount: p.counter_price ? Number(p.counter_price) : undefined,
          counterDpPercentage: p.counter_dp_percentage ? Number(p.counter_dp_percentage) : undefined,
          counterNotes: p.counter_notes || undefined,
          lastUpdatedBy: p.last_action_by === myId ? 'Kamu' : 'Pihak lain',
          // Only the party who did not act last can counter or accept.
          myTurn: p.last_action_by !== myId,
          attachedFileName: p.attached_file_name || null,
          attachedFileSize: p.attached_file_size || null,
          contractDocumentUrl: p.contract_document_url || null,
        }));
        setProposals(mapped);
        setLoadError(null);
      })
      .catch((err) => {
        setProposals([]);
        setLoadError(err instanceof ApiError ? err.message : 'Daftar kontrak belum bisa dimuat.');
      })
      .finally(() => setLoadingList(false));
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

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      fetchLiveProposals();
      onShowToast?.(success);
      return true;
    } catch (err) {
      onShowToast?.(err instanceof ApiError ? err.message : 'Aksi belum berhasil. Coba lagi.');
      return false;
    }
  };

  const handleSubmitCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterTarget) return;
    const ok = await run(
      () => api(`/proposals/${counterTarget.id}/counter`, { method: 'POST', body: { counter_price: counterPrice, counter_dp_percentage: counterDp, counter_notes: counterNotes || undefined } }),
      'Penawaran balik terkirim ke mitra.'
    );
    if (ok) setCounterTarget(null);
  };

  const handleApproveProposal = (item: ContractProposalItem) =>
    run(() => api(`/proposals/${item.id}/respond`, { method: 'POST', body: { action: 'ACCEPT' } }), `Kesepakatan disetujui. PKS untuk ${item.eventTitle} diterbitkan.`);

  const handleRejectProposal = (item: ContractProposalItem) =>
    run(() => api(`/proposals/${item.id}/respond`, { method: 'POST', body: { action: 'REJECT' } }), `Penawaran untuk ${item.partyTwo} ditolak.`);

  const handleOpenPks = (item: ContractProposalItem) => {
    setSelectedForPks(item);
    setIsPksModalOpen(true);
  };

  // Payment happens on Midtrans. The contract turns "funded" only after their confirmation reaches our server.
  const handleSignAndFund = async () => {
    if (!selectedForPks) return;
    try {
      const data = await api(`/payments/proposals/${selectedForPks.id}/checkout`, { method: 'POST' });
      window.location.href = data.redirect_url;
    } catch (err) {
      onShowToast?.(err instanceof ApiError ? err.message : 'Pembayaran belum bisa dimulai.');
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

        {loadError && (
          <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {loadError}
          </p>
        )}

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
        {loadingList ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          proposals.length === 0 ? (
            <EmptyState title={t('contracts.emptyTitle')} body={t('contracts.emptyBody')} icon={<FileText aria-hidden="true" className="h-7 w-7" />} />
          ) : (
            <EmptyState title={t('contracts.noMatch')} body={t('contracts.noMatchBody')} />
          )
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
                      {item.myTurn === false && (
                        <p className="w-full rounded-2xl bg-brand-sand px-4 py-3 text-center text-sm font-semibold text-brand-ink">
                          Menunggu jawaban pihak lain
                        </p>
                      )}
                      {item.myTurn !== false && <button
                        onClick={() => handleApproveProposal(item)}
                        className="w-full min-h-12 px-5 rounded-full text-sm font-semibold bg-brand-navy hover:bg-brand-navy-dark text-white flex items-center justify-center gap-2 transition-colors"
                      >
                        <CheckCircle2 aria-hidden="true" className="w-5 h-5 text-brand-lime" />
                        <span>Setujui kesepakatan</span>
                      </button>}

                      {item.myTurn !== false && <button
                        onClick={() => handleOpenCounterModal(item)}
                        className="w-full min-h-12 px-5 rounded-full text-sm font-semibold border-2 border-brand-navy/30 hover:border-brand-navy text-brand-ink flex items-center justify-center gap-2 transition-colors"
                      >
                        <RotateCcw aria-hidden="true" className="w-5 h-5" />
                        <span>Ajukan perubahan (counter)</span>
                      </button>}

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
        <Dialog onClose={() => setCounterTarget(null)} label="Ajukan perubahan kontrak">
          <div className="bg-white rounded-lg max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-sm tabular-nums text-slate-500 font-semibold">{counterTarget.contractNumber}</span>
                <h3 className="font-extrabold text-slate-900 text-base">Ajukan perubahan (counter-offer)</h3>
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
                  Nominal penawaran baru (Rp)
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
                  Alasan penyesuaian dan catatan teknis
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
        </Dialog>
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
