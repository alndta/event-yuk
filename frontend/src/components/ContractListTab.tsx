import {
  FileCheck,
  ShieldCheck,
  Calendar,
  Clock,
  Handshake,
  Paperclip,
} from 'lucide-react';

export interface CollaborationContract {
  id: string;
  contractNumber: string;
  partyOne: string; // EO
  partyTwo: string; // Vendor / Band
  roleType: 'VENDOR' | 'TALENT' | 'TENANT' | 'SPONSOR';
  eventTitle: string;
  totalAmount: number;
  dpPercentage: number;
  scopeOfWork: string;
  date: string;
  status: 'SUBMITTED' | 'NEGOTIATION' | 'CONTRACT_SIGNED' | 'ESCROW_FUNDED';
  attachedFileName?: string | null;
  attachedFileSize?: string | null;
  contractDocumentUrl?: string | null;
}

export const initialContracts: CollaborationContract[] = [
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
    attachedFileName: 'PKS_Vendor_Rigging_Audio_Nusantara.pdf',
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
    attachedFileName: 'MoU_SenjaDiBatavia_Labschool.docx',
    attachedFileSize: '1.2 MB',
  },
  {
    id: 'cnt-3',
    contractNumber: 'PKS/EY/2026/092551',
    partyOne: 'Kolektif Ruang Rasa (EO)',
    partyTwo: 'Luminary Stage & Visual FX',
    roleType: 'VENDOR',
    eventTitle: 'Urban Coffee & Craft Bazaar Vol. 5',
    totalAmount: 28000000,
    dpPercentage: 40,
    scopeOfWork: 'Instalasi Videotron LED P3.9 6x4m dan 16 Moving Head Beam.',
    date: '26 Oktober 2026',
    status: 'NEGOTIATION',
  },
];

interface Props {
  contracts: CollaborationContract[];
  onViewContract: (contract: CollaborationContract) => void;
  onFundEscrow: (contract: CollaborationContract) => void;
}

export default function ContractListTab({ contracts, onViewContract, onFundEscrow }: Props) {
  const getStatusBadge = (status: CollaborationContract['status']) => {
    switch (status) {
      case 'ESCROW_FUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Escrow Terproteksi</span>
          </span>
        );
      case 'CONTRACT_SIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <FileCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>PKS Ditandatangani</span>
          </span>
        );
      case 'NEGOTIATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Tahap kesepakatan nilai</span>
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Handshake className="w-3.5 h-3.5 text-slate-500" />
            <span>Draf penawaran baru</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            <span>Daftar kontrak dan perjanjian kerja sama (PKS)</span>
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Daftar pengajuan dua arah antara Event Organizer, Vendor Peralatan, dan Manajemen Band dengan jaminan hukum serta rekening bersama.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            Total <strong>{contracts.length}</strong> Kontrak Tercatat
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {contracts.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-lg p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="tabular-nums font-bold text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {c.contractNumber}
                </span>
                {getStatusBadge(c.status)}
                <span className="text-sm text-slate-400">•</span>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {c.date}
                </span>
              </div>

              <h4 className="font-extrabold text-base text-slate-900">
                {c.partyTwo} ({c.roleType})
              </h4>
              <div className="text-sm text-slate-600">
                Penyelenggara: <strong className="text-slate-800">{c.partyOne}</strong> pada kegiatan: <em className="text-indigo-600 font-medium">{c.eventTitle}</em>
              </div>
              <p className="text-sm text-slate-500 line-clamp-1">
                Lingkup Kerja: {c.scopeOfWork}
              </p>

              {c.attachedFileName && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-sm font-semibold border border-amber-200">
                  <Paperclip className="w-3 h-3 text-[#5E7628]" />
                  <span className="truncate max-w-xs">{c.attachedFileName}</span>
                  <span className="text-amber-600 tabular-nums text-sm">({c.attachedFileSize || 'File'})</span>
                </div>
              )}
            </div>

            {/* Financial pill & actions */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <div className="text-sm text-slate-400 font-medium">Nilai kontrak bersih</div>
                <div className="font-extrabold text-slate-900 text-base tabular-nums">
                  Rp {c.totalAmount.toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-slate-500">
                  Termin DP: {c.dpPercentage}% | Pelunasan: {100 - c.dpPercentage}%
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onViewContract(c)}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition flex items-center justify-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lihat Dokumen PKS</span>
                </button>

                {c.status === 'CONTRACT_SIGNED' && (
                  <button
                    onClick={() => onFundEscrow(c)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Setor Escrow</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
