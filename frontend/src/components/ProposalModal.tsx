import useDialog from '../hooks/useDialog';
import React, { useState, useRef } from 'react';
import {
  X,
  FileText,
  DollarSign,
  ShieldCheck,
  Handshake,
  Send,
  UploadCloud,
  Paperclip,
  CheckCircle2,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { EventItem } from '../types/models';
import { PartnerItem } from '../types/models';
import { api, ApiError } from '../lib/api';

interface Props {
  isOpen: boolean;
  event?: EventItem | null;
  partner?: PartnerItem | null;
  mode: 'PARTNER_TO_EO' | 'EO_TO_PARTNER';
  /** The organizer's own events, offered as the target when inviting a partner. */
  myEvents?: EventItem[];
  onClose: () => void;
  onSuccess: (proposalData: any) => void;
}

function ProposalModalInner({
  isOpen,
  event,
  partner,
  mode,
  myEvents = [],
  onClose,
  onSuccess,
}: Props) {
  const dialogRef = useDialog(onClose);
  const [formData, setFormData] = useState({
    title: '',
    offeredPrice: '',
    dpPercentage: '50',
    scopeOfWork: '',
    ridersOrSpecs: '',
  });

  // Contract attachment type: GENERATED (system draft) or UPLOAD_CUSTOM (.pdf, .doc, .docx)
  const [contractDocMode, setContractDocMode] = useState<'GENERATED' | 'UPLOAD_CUSTOM'>('GENERATED');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState('');

  if (!isOpen) return null;

  const targetTitle = event ? event.title : partner ? partner.name : 'Mitra Terpilih';
  const roleType = partner ? partner.type : 'VENDOR';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate extension: pdf, doc, docx
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      alert('Format berkas harus berupa dokumen .pdf, .doc, atau .docx');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setUploadedFile({
      name: file.name,
      size: sizeFormatted,
      type: ext || 'doc',
    });

    // Simulate upload progress
    setUploadProgress(20);
    setTimeout(() => setUploadProgress(65), 150);
    setTimeout(() => setUploadProgress(100), 300);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const eventId = event ? event.id : selectedEventId;
    const receiverId = event ? event.organizerId : partner?.id;
    if (!eventId) return setError('Pilih acara yang menjadi tujuan kerja sama ini.');
    if (!receiverId) return setError('Penerima pengajuan belum diketahui. Muat ulang halaman lalu coba lagi.');

    const price = parseInt(formData.offeredPrice.replace(/\D/g, ''), 10);
    if (!price) return setError('Isi nominal penawaran.');

    setLoading(true);
    try {
      const res = await api('/proposals', {
        method: 'POST',
        body: {
          event_id: eventId,
          receiver_id: receiverId,
          proposal_type: roleType,
          direction: mode,
          title: formData.title.trim() || `Penawaran kerja sama: ${targetTitle}`,
          offered_price: price,
          dp_percentage: parseInt(formData.dpPercentage, 10) || 50,
          scope_of_work: formData.scopeOfWork,
          riders_or_specs: formData.ridersOrSpecs ? { details: formData.ridersOrSpecs } : {},
          attached_file_name: uploadedFile?.name || null,
          attached_file_size: uploadedFile?.size || null,
        },
      });
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Penawaran belum terkirim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dialogRef} className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#172D46]/10 text-[#172D46] text-sm font-bold mb-1 border border-[#172D46]/20">
              <Handshake className="w-3.5 h-3.5 text-[#172D46]" />
              {mode === 'PARTNER_TO_EO' ? 'Pengajuan Penawaran Mitra ke Acara' : 'Undangan Resmi EO ke Mitra'}
            </div>
            <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">
              {mode === 'PARTNER_TO_EO' ? 'Ajukan Proposal & Penawaran Biaya' : 'Kirim Undangan Kerjasama Resmi'}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Ditujukan untuk: <strong className="text-slate-800">{targetTitle}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm font-sans">
          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-800">{error}</p>
          )}
          {mode === 'EO_TO_PARTNER' && (
            <div>
              <label htmlFor="proposal-event" className="block font-semibold text-slate-700 mb-1">Untuk acara yang mana</label>
              <select
                id="proposal-event"
                required
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-navy/30 focus:outline-none"
              >
                <option value="">{myEvents.length ? 'Pilih acaramu' : 'Kamu belum punya acara aktif'}</option>
                {myEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>
          )}
          {/* Judul */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Judul penawaran atau pekerjaan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Paket Panggung & Rigging 12x10m / Guest Star Penampilan 45 Menit"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none text-slate-800 font-medium"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Pricing & Escrow DP Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Nominal kesepakatan (Rp)</span>
              </label>
              <input
                type="text"
                required
                placeholder="Misal: 35.000.000"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none text-slate-800 font-medium tabular-nums"
                value={formData.offeredPrice}
                onChange={(e) => setFormData({ ...formData, offeredPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Skema Termin DP Escrow</span>
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none bg-white text-slate-800 font-medium"
                value={formData.dpPercentage}
                onChange={(e) => setFormData({ ...formData, dpPercentage: e.target.value })}
              >
                <option value="30">DP 30% (Pelunasan 70% Pasca-BAST)</option>
                <option value="40">DP 40% (Pelunasan 60% Pasca-BAST)</option>
                <option value="50">DP 50% (Pelunasan 50% Pasca-BAST)</option>
                <option value="70">DP 70% (Pelunasan 30% Pasca-BAST)</option>
                <option value="100">100% di Muka (Tersimpan di Escrow)</option>
              </select>
            </div>
          </div>

          {/* Scope of Work */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lingkup kerja
            </label>
            <textarea
              rows={2}
              placeholder="Jelaskan ruang lingkup pekerjaan, jadwal loading/soundcheck, dan deliverables..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none text-slate-800"
              value={formData.scopeOfWork}
              onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
            />
          </div>

          {/* Riders or Specs */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Spesifikasi teknis dan rider
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Daya 40kVA, Line Array 12 Box, Microphone Wireless Shure, Ruang Tunggu Ber-AC..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#172D46] focus:outline-none tabular-nums text-sm text-slate-800"
              value={formData.ridersOrSpecs}
              onChange={(e) => setFormData({ ...formData, ridersOrSpecs: e.target.value })}
            />
          </div>

          {/* Format PKS: Generated vs Custom File Upload (.doc, .pdf) */}
          <div className="pt-2">
            <label className="block font-bold text-slate-800 text-sm mb-2">
              Pilihan Dokumen Perjanjian Kerjasama (PKS / MoU)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
              <button
                type="button"
                onClick={() => setContractDocMode('GENERATED')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition ${
                  contractDocMode === 'GENERATED'
                    ? 'border-[#172D46] bg-[#172D46]/5 ring-1 ring-[#172D46]'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                    contractDocMode === 'GENERATED'
                      ? 'border-[#172D46] bg-[#172D46]'
                      : 'border-slate-400'
                  }`}
                >
                  {contractDocMode === 'GENERATED' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#172D46]" />
                    <span>Draf PKS Digital Otomatis</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5 leading-snug">
                    Sistem menerbitkan pasal baku perlindungan hukum dan termin otomatis.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setContractDocMode('UPLOAD_CUSTOM')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition ${
                  contractDocMode === 'UPLOAD_CUSTOM'
                    ? 'border-[#5E7628] bg-[#5E7628]/5 ring-1 ring-[#5E7628]'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                    contractDocMode === 'UPLOAD_CUSTOM'
                      ? 'border-[#5E7628] bg-[#5E7628]'
                      : 'border-slate-400'
                  }`}
                >
                  {contractDocMode === 'UPLOAD_CUSTOM' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-[#5E7628]" />
                    <span>Unggah berkas sendiri (.pdf atau .doc)</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5 leading-snug">
                    Gunakan draf kontrak khusus dari legal internal perusahaan kamu.
                  </p>
                </div>
              </button>
            </div>

            {/* Custom Upload Dropzone */}
            {contractDocMode === 'UPLOAD_CUSTOM' && (
              <div className="p-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100/50 transition">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="custom-pks-upload"
                />

                {!uploadedFile ? (
                  <label
                    htmlFor="custom-pks-upload"
                    className="flex flex-col items-center justify-center cursor-pointer py-3 text-center"
                  >
                    <div className="p-2.5 rounded-lg bg-white text-[#5E7628] border border-slate-200 mb-2">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm text-slate-800">
                      Klik untuk memilih berkas atau seret berkas ke sini
                    </span>
                    <span className="text-sm text-slate-500 mt-0.5">
                      Format .PDF, .DOC, atau .DOCX, maksimal 15 MB
                    </span>
                  </label>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-orange-50 text-[#5E7628] border border-orange-200 shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {uploadedFile.name}
                          </p>
                          <p className="text-sm text-slate-500 tabular-nums">
                            {uploadedFile.size} • Format .{uploadedFile.type.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Siap</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus berkas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {uploadProgress < 100 && (
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#5E7628] h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legal Escrow Notice */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#172D46]" />
              <span>Kepastian hukum dan Escrow</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              {contractDocMode === 'UPLOAD_CUSTOM' && uploadedFile
                ? `Berkas lampiran "${uploadedFile.name}" akan dijadikan dokumen acuan utama dan diikat ke rekening bersama Escrow Midtrans setelah disetujui kedua belah pihak.`
                : 'Setelah kedua pihak menyepakati harga dan riders, sistem akan menerbitkan draf PKS resmi dan mengunci pembayaran ke dalam buku besar Escrow Rekening Bersama.'}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || (contractDocMode === 'UPLOAD_CUSTOM' && !uploadedFile)}
              className="px-5 min-h-12 text-white rounded-full font-bold transition flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-brand-navy hover:bg-brand-navy-dark transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Mengirim...' : 'Kirim Penawaran & Kunci PKS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProposalModal(props: Props) {
  if (!props.isOpen) return null;
  return <ProposalModalInner {...props} />;
}
