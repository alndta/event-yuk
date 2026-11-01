import { useState, useEffect, useRef } from 'react';
import useGsapReveal from '../hooks/useGsapReveal';
import { useParams, Link } from 'react-router-dom';
import {
  Sliders,
  Music,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  ArrowLeft,
  Send,
  FileText,
  Wrench,
  Volume2,
  Users,
  Clock,
  Building2,
} from 'lucide-react';
import { mockPartners, PartnerItem } from '../data/mockPartners';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';
import { DetailSkeleton } from '../components/skeletons/DetailSkeleton';
import { cachedFetch } from '../utils/apiCache';
import Avatar from '../components/Avatar';

interface Props {
  onProposePartner: (partner: PartnerItem) => void;
}

export default function PartnerDetailPage({ onProposePartner }: Props) {
  const { id } = useParams();
  const { requireAuth } = useAuth();

  const fallbackPartner = mockPartners.find((p) => p.id === id) || mockPartners[0];
  const [partner, setPartner] = useState<any>(fallbackPartner);
  const [loading, setLoading] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, '[data-gsap-reveal]', [id, loading]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    cachedFetch(`/api/v1/partners/${id}`)
      .then((resData: any) => {
        if (resData.success && resData.data) {
          setPartner(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleProposeClick = () => {
    requireAuth(() => {
      onProposePartner({
        id: partner.id,
        name: partner.name,
        type: partner.type,
        categoryLabel: partner.categoryLabel,
        city: partner.city,
        rating: partner.rating,
        avatar: partner.avatar,
        priceRange: partner.priceRange || 'Sesuai Kesepakatan',
        specsOrRiders: partner.specsOrRiders || [],
        description: partner.description || '',
        completedGigs: partner.completedGigs || 0,
      });
    }, `Ingin mengajak ${partner.name} berkolaborasi? Masuk akun dulu agar pengajuan resmi langsung terkirim.`);
  };

  const isVendor = partner.type === 'VENDOR';
  const isTalent = partner.type === 'TALENT';
  const isEO = partner.type === 'EO';

  const packages = partner.packages || [];
  const talentProfile = partner.talentProfile;

  const partnerSchema = partner
    ? {
        '@context': 'https://schema.org',
        '@type': isTalent ? 'MusicGroup' : 'LocalBusiness',
        name: partner.name,
        image: [partner.avatar],
        description: partner.description || `${partner.categoryLabel} di ${partner.city}.`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: partner.city || 'Jakarta',
          addressCountry: 'ID',
        },
        ...(partner.rating && partner.completedGigs
          ? {
              aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: partner.rating,
          reviewCount: partner.completedGigs,
              },
            }
          : {}),
      }
    : undefined;

  if (loading && !partner) {
    return <DetailSkeleton />;
  }

  const backTo = isVendor ? '/vendors' : isTalent ? '/bands' : '/organizers';
  const backLabel = isVendor ? 'Kembali ke direktori vendor' : isTalent ? 'Kembali ke direktori band' : 'Kembali ke direktori mitra';
  const ctaLabel = isVendor ? 'Ajukan sewa alat' : isTalent ? 'Ajukan tawaran manggung' : 'Ajak kolaborasi';
  const contactPhone: string | undefined = partner.managerContact;
  const contactEmail: string | undefined = partner.contactEmail;

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div data-gsap-reveal className="space-y-5 rounded-lg bg-white p-6 sm:p-8">{children}</div>
  );
  const CardTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <h2 className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink">
      <span aria-hidden="true" className="text-brand-forest">{icon}</span>
      {children}
    </h2>
  );
  const Fact = ({ label, value, wide = false }: { label: string; value: React.ReactNode; wide?: boolean }) => (
    <div className={'rounded-lg bg-brand-cream p-4 ' + (wide ? 'sm:col-span-2' : '')}>
      <dt className="text-sm text-slate-700">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-brand-ink">{value}</dd>
    </div>
  );

  return (
    <div ref={pageRef} className="space-y-8 font-sans sm:space-y-10">
      <SEOHead
        title={`${partner.name} — Spesifikasi, Rate Card & Sewa | Event Yuk`}
        description={
          partner.description
            ? `${partner.description.slice(0, 150)}... Bergaransi pembayaran aman Rekening Bersama Escrow & PKS digital.`
            : `Lihat profil ${partner.name}, spesifikasi teknis, harga sewa / rate card di ${partner.city}.`
        }
        keywords={`${partner.name}, sewa ${partner.name}, rate card ${partner.name}, ${partner.categoryLabel}, ${partner.city}`}
        canonicalPath={`/partners/${partner.id || id}`}
        ogImage={partner.avatar}
        schemaJson={partnerSchema}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backTo}
          className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-slate-700 hover:text-brand-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {backLabel}
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-forest-light px-4 py-1.5 text-sm font-semibold text-brand-forest-dark">
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          Mitra terverifikasi e-KYC dan Escrow
        </span>
      </div>

      <header data-gsap-reveal className="rounded-lg bg-brand-navy p-6 text-white sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar
              src={partner.avatar}
              name={partner.name}
              decorative
              className="h-24 w-24 rounded-lg sm:h-28 sm:w-28"
            />
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-lime px-3 py-1 text-sm font-semibold text-brand-navy">
                {isVendor ? (
                  <Sliders aria-hidden="true" className="h-4 w-4" />
                ) : isTalent ? (
                  <Music aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Building2 aria-hidden="true" className="h-4 w-4" />
                )}
                {partner.categoryLabel}
              </p>
              <h1 className="mt-3 flex items-center gap-2 font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">
                {partner.name}
                <CheckCircle2 aria-label="Terverifikasi" className="h-7 w-7 shrink-0 text-brand-lime" />
              </h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-200">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="h-4 w-4" />
                  {partner.city}
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-brand-lime">
                  <Star aria-hidden="true" className="h-4 w-4 fill-current" />
                  {partner.rating} / 5.0 rating mitra
                </span>
                <span>{partner.completedGigs || 45} acara berhasil</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProposeClick}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-lime px-8 text-base font-semibold text-brand-navy transition-colors hover:bg-brand-lime-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Send aria-hidden="true" className="h-5 w-5" />
            {ctaLabel}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardTitle icon={<FileText className="h-5 w-5" />}>Tentang mitra</CardTitle>
            <p className="text-base leading-7 text-slate-700">
              {partner.description ||
                'Mitra terverifikasi resmi dalam ekosistem Event Yuk dengan jaminan kepatuhan teknis, transparansi biaya, dan kontrak digital yang mengikat secara hukum.'}
            </p>
            <dl className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
              <Fact label="Pengalaman kerja" value={(partner.experienceYears || 6) + ' tahun di industri'} />
              <Fact
                label="Status verifikasi"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                    e-KYC lolos
                  </span>
                }
              />
              <Fact label="Garansi escrow" value="Pencairan bertahap" />
            </dl>
          </Card>

          {isVendor && (
            <>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle icon={<Wrench className="h-5 w-5" />}>Paket dan inventaris peralatan</CardTitle>
                  <span className="rounded-full bg-brand-lime-soft px-3 py-1 text-sm font-semibold text-brand-navy">
                    Standar keselamatan K3
                  </span>
                </div>

                {packages.length > 0 ? (
                  <div className="space-y-4">
                    {packages.map((pkg: any) => (
                      <div key={pkg.id} className="space-y-4 rounded-lg bg-brand-cream p-5">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                          <h3 className="font-display text-xl font-extrabold tracking-[-0.02em] text-brand-ink">{pkg.package_name}</h3>
                          <span className="font-display text-xl font-extrabold text-brand-ink">
                            Rp {Number(pkg.base_price).toLocaleString('id-ID')}
                            <span className="text-sm font-normal text-slate-600"> / hari</span>
                          </span>
                        </div>

                        {pkg.tech_specs && (
                          <div className="space-y-2 rounded-lg bg-white p-4 text-base">
                            <p className="text-sm font-semibold text-slate-800">Spesifikasi teknis alat</p>
                            {Object.entries(pkg.tech_specs).map(([key, val]) => (
                              <div key={key} className="flex justify-between gap-4 text-slate-700">
                                <span className="capitalize text-slate-600">{key.replace('_', ' ')}</span>
                                <span className="text-right font-semibold text-brand-ink">{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm text-slate-600">
                            Kuota harian: maksimal {pkg.daily_quota || 2} unit
                          </span>
                          <button
                            type="button"
                            onClick={handleProposeClick}
                            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
                          >
                            Pilih paket ini
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {partner.specsOrRiders?.map((spec: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex flex-col justify-between gap-1 rounded-lg bg-brand-cream p-4 sm:flex-row sm:items-center"
                      >
                        <span className="text-base font-medium text-brand-ink">{spec}</span>
                        <span className="text-sm font-semibold text-brand-forest-dark">Tersedia untuk acara</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <div data-gsap-reveal className="space-y-3 rounded-lg bg-brand-navy p-6 text-white sm:p-8">
                <p className="flex items-center gap-2 font-display text-xl font-extrabold">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5 text-brand-lime" />
                  Jaminan BAST digital dan pencairan DP yang aman
                </p>
                <p className="text-base leading-7 text-slate-200">
                  Vendor ini mematuhi standar kerja Event Yuk: DP 30%–50% ditahan di Rekening Bersama Escrow dan baru dicairkan saat surat jalan atau alat tiba di lokasi. Sisa pelunasan dicairkan setelah Berita Acara Serah Terima (BAST) digital ditandatangani kedua belah pihak pasca-acara selesai.
                </p>
              </div>
            </>
          )}

          {isTalent && (
            <>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle icon={<Volume2 className="h-5 w-5" />}>Technical dan sound rider panggung</CardTitle>
                  <span className="rounded-full bg-brand-lime-soft px-3 py-1 text-sm font-semibold text-brand-navy">
                    Genre: {talentProfile?.genre || 'Indie Pop-Rock'}
                  </span>
                </div>

                {talentProfile?.technical_riders ? (
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Fact label="Kebutuhan channel mixer FOH" value={(talentProfile.technical_riders.channels || 24) + ' channel digital'} />
                    <Fact label="Sistem monitor panggung" value={talentProfile.technical_riders.monitors || '4 IEM Wireless + 2 Wedges'} />
                    <Fact
                      wide
                      label="Backline amplifier pilihan"
                      value={talentProfile.technical_riders.amps || 'Fender Twin Reverb (Gitar) & Ampeg SVT-CL (Bass)'}
                    />
                  </dl>
                ) : (
                  <ul className="space-y-2">
                    {partner.specsOrRiders?.map((rider: string, idx: number) => (
                      <li key={idx} className="rounded-lg bg-brand-cream p-4 text-base text-slate-800">
                        {rider}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card>
                <CardTitle icon={<Users className="h-5 w-5" />}>Hospitality dan ruang artis</CardTitle>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Fact label="Ruang tunggu backstage" value={talentProfile?.hospitality_riders?.rooms || '1 Ruang VIP AC Bersih'} />
                  <Fact label="Konsumsi personel" value={talentProfile?.hospitality_riders?.meals || '15 Box Bento & Buah'} />
                  <Fact label="Transportasi lokal" value={talentProfile?.hospitality_riders?.transfers || '2 Unit Van / HiAce'} />
                </dl>
              </Card>

              <div data-gsap-reveal className="space-y-3 rounded-lg bg-brand-navy p-6 text-white sm:p-8">
                <p className="flex items-center gap-2 font-display text-xl font-extrabold">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5 text-brand-lime" />
                  PKS sah dan kebijakan anti-cancel sepihak
                </p>
                <p className="text-base leading-7 text-slate-200">
                  Semua penawaran manggung wajib dituangkan ke dalam PKS digital resmi. DP terkunci aman di Escrow dan hanya cair sesuai termin kesepakatan (50% saat PKS ditandatangani, 50% setelah soundcheck/tampil).
                </p>
              </div>
            </>
          )}

          {isEO && (
            <Card>
              <CardTitle icon={<Building2 className="h-5 w-5" />}>Standar produksi dan manajemen acara</CardTitle>
              <p className="text-base leading-7 text-slate-700">
                Penyelenggara acara resmi dengan rekam jejak penyelenggaraan festival terbuka, pensi kampus/sekolah, dan bazaar tematik. Mengedepankan standarisasi keselamatan massa, perizinan lengkap, dan ketepatan waktu pembayaran vendor & kru.
              </p>
              <div className="rounded-lg bg-brand-lime-soft p-5">
                <p className="text-base font-semibold text-brand-ink">Membuka kemitraan</p>
                <p className="mt-1 text-base leading-7 text-slate-700">
                  Vendor sound & lighting, tenant kuliner/bazaar, serta kru lapangan untuk proyek acara aktif.
                </p>
              </div>
            </Card>
          )}
        </div>

        <aside>
          <div data-gsap-reveal className="sticky top-24 space-y-6 rounded-lg bg-white p-6 sm:p-8">
            <div>
              <p className="text-sm text-slate-700">Perkiraan honor / tarif</p>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-ink">
                {partner.priceRange || 'Rp 25.000.000'}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Bisa dinegosiasikan lewat fitur Counter-Offer di ruang kerja PKS.
              </p>
            </div>

            <button
              type="button"
              onClick={handleProposeClick}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-6 text-base font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
            >
              <Send aria-hidden="true" className="h-5 w-5 text-brand-lime" />
              {isVendor ? 'Ajukan tawaran sewa alat' : isTalent ? 'Ajukan jadwal manggung' : 'Ajak kolaborasi proyek'}
            </button>

            <ul className="space-y-3 border-t border-slate-200 pt-5 text-base text-slate-700">
              <li className="flex items-start gap-3">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest" />
                Dana DP 50% terlindungi di Escrow Midtrans
              </li>
              <li className="flex items-start gap-3">
                <FileText aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest" />
                Surat Perjanjian Kerja Sama (PKS) digital resmi
              </li>
              <li className="flex items-start gap-3">
                <Clock aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest" />
                Respons kurasi rata-rata dalam 1x24 jam
              </li>
            </ul>

            {(contactPhone || contactEmail) && (
              <div className="space-y-2 rounded-lg bg-brand-cream p-4">
                <p className="text-sm font-semibold text-slate-800">Kontak</p>
                {contactPhone && (
                  <p className="flex items-center gap-2 text-base font-semibold text-brand-ink">
                    <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-600" />
                    {contactPhone}
                  </p>
                )}
                {contactEmail && (
                  <p className="flex items-center gap-2 break-all text-base text-slate-700">
                    <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-600" />
                    {contactEmail}
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
