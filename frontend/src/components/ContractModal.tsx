import useDialog from '../hooks/useDialog';
import { useState } from 'react';
import {
  X,
  FileCheck,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Download,
  Paperclip,
  Lock,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  contractData: {
    contractNumber: string;
    partyOne: string; // EO
    partyTwo: string; // Vendor / Band
    roleType: string;
    eventTitle: string;
    totalAmount: number;
    dpPercentage: number;
    scopeOfWork: string;
    date: string;
    attachedFileName?: string | null;
    attachedFileSize?: string | null;
    contractDocumentUrl?: string | null;
  };
  onClose: () => void;
  onSignAndFund: () => void;
}

function ContractModalInner({ isOpen, contractData, onClose, onSignAndFund }: Props) {
  const dialogRef = useDialog(onClose);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const dpAmount = (contractData.totalAmount * contractData.dpPercentage) / 100;
  const settlementAmount = contractData.totalAmount - dpAmount;

  const handleSimulateDownload = (fileName: string) => {
    setDownloadSuccess(true);
    // Create a mock text file download to simulate realistic file retrieval
    const dummyBlob = new Blob(
      [
        `SURAT PERJANJIAN KERJASAMA (PKS)\nNo: ${contractData.contractNumber}\nAcara: ${contractData.eventTitle}\nPihak 1: ${contractData.partyOne}\nPihak 2: ${contractData.partyTwo}\nTotal: Rp ${contractData.totalAmount.toLocaleString('id-ID')}\nStatus: Terverifikasi Escrow Event Yuk`
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dummyBlob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div ref={dialogRef} className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#172D46]/10 text-[#172D46] border border-[#172D46]/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm tabular-nums text-slate-500 font-semibold">
                No. Registrasi: {contractData.contractNumber}
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                Surat Perjanjian Kerjasama (PKS / MoU Digital)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Container */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700 font-sans leading-relaxed">
          {/* Custom File Attachment Banner (If user uploaded their own .pdf / .doc) */}
          {contractData.attachedFileName && (
            <div className="p-4 rounded-lg border border-amber-300/60 flex items-center justify-between bg-brand-lime-soft">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-white border border-amber-200 text-[#5E7628] shrink-0">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1 text-sm font-bold text-[#5E7628]">
                    <span>Dokumen Kontrak Mandiri Terlampir</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {contractData.attachedFileName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {contractData.attachedFileSize || '2.4 MB'} • Format Dokumen Resmi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSimulateDownload(contractData.attachedFileName || 'dokumen-pks.pdf')}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm flex items-center gap-1.5 hover:shadow transition shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-[#172D46]" />
                <span>{downloadSuccess ? 'Tersimpan' : 'Unduh Berkas'}</span>
              </button>
            </div>
          )}

          {/* Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="font-extrabold text-base text-slate-900">
              PERJANJIAN KERJASAMA PENGADAAN & PENAMPILAN ACARA
            </div>
            <div className="text-sm text-slate-600 mt-0.5">
              PLATFORM EKOSISTEM EVENT-YUK DENGAN PROTEKSI REKENING BERSAMA ESCROW
            </div>
            <div className="text-sm tabular-nums text-slate-500 mt-1">
              Nomor: {contractData.contractNumber} • Tanggal: {contractData.date}
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block text-sm mb-1">
                PIHAK PERTAMA (EVENT ORGANIZER)
              </span>
              <div className="font-bold text-slate-800 text-sm">{contractData.partyOne}</div>
              <div className="text-slate-500 text-sm">
                Penyelenggara Acara: <strong>{contractData.eventTitle}</strong>
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-sm mb-1">
                PIHAK KEDUA ({contractData.roleType})
              </span>
              <div className="font-bold text-slate-800 text-sm">{contractData.partyTwo}</div>
              <div className="text-slate-500 text-sm">Mitra Terverifikasi Platform Event Yuk</div>
            </div>
          </div>

          {/* Clauses */}
          <div className="space-y-3.5">
            <div>
              <div className="font-bold text-slate-900 text-sm mb-1">
                Pasal 1: Lingkup Kesepakatan & Pekerjaan
              </div>
              <p className="text-slate-600">
                Pihak Pertama sepakat untuk bermitra dengan Pihak Kedua dalam pelaksanaan kegiatan{' '}
                <strong>{contractData.eventTitle}</strong> dengan rincian lingkup kerja:{' '}
                <em>{contractData.scopeOfWork || 'Penyediaan teknis / penampilan panggung sesuai kesepakatan tertulis.'}</em>
              </p>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm mb-1">
                Pasal 2: Nilai Kontrak & Termin Pembayaran Escrow
              </div>
              <div className="bg-slate-100 p-3.5 rounded-lg border border-slate-200 tabular-nums space-y-1.5">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Nilai Kontrak (Net):</span>
                  <span>Rp {contractData.totalAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Termin 1 (DP {contractData.dpPercentage}% saat H-7 / Loading Alat):</span>
                  <span>Rp {dpAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Termin 2 (Pelunasan 100% pasca BAST Digital 2x24 Jam):</span>
                  <span>Rp {settlementAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#172D46]" />
                <span>Pasal 3: Jaminan Rekening Bersama (Escrow) & Arbitrase</span>
              </div>
              <p className="text-slate-600">
                Seluruh dana kontrak wajib didepositkan oleh Pihak Pertama ke rekening Escrow Midtrans sebelum kegiatan logistik atau gladi resik dimulai. Pencairan dana dilakukan secara bertahap berbasis Berita Acara Serah Terima (BAST) Digital. Apabila terjadi pembatalan sepihak atau wanprestasi, penyelesaian tunduk pada mediasi dan putusan Arbitrase Super Admin Event Yuk.
              </p>
            </div>
          </div>

          {/* Signatures Stamp Area */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-center">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-500 font-semibold mb-5">Pihak Pertama (EO)</div>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tervalidasi Digital
              </div>
              <div className="font-bold text-slate-800 mt-2">{contractData.partyOne}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-500 font-semibold mb-5">
                Pihak Kedua ({contractData.roleType})
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tervalidasi Digital
              </div>
              <div className="font-bold text-slate-800 mt-2">{contractData.partyTwo}</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PKS</span>
            </button>
            {contractData.attachedFileName && (
              <button
                onClick={() => handleSimulateDownload(contractData.attachedFileName || 'berkas-pks.pdf')}
                className="px-3 py-2 text-sm font-semibold text-[#172D46] hover:bg-[#172D46]/10 rounded-lg transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas Lampiran</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              Tutup
            </button>
            <button
              onClick={onSignAndFund}
              className="px-5 min-h-12 text-white rounded-full font-bold text-sm transition flex items-center gap-2 bg-brand-navy hover:bg-brand-navy-dark transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Tandatangani & Lanjutkan Escrow Midtrans</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractModal(props: Props) {
  if (!props.isOpen) return null;
  return <ContractModalInner {...props} />;
}
