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
  Building2,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { PartnerItem } from '../types/models';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';
import { DetailSkeleton } from '../components/skeletons/DetailSkeleton';
import { cachedFetch } from '../utils/apiCache';
import Avatar from '../components/Avatar';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onProposePartner: (partner: PartnerItem) => void;
}

export default function PartnerDetailPage({ onProposePartner }: Props) {
  const { t } = useLanguage();
  const { id } = useParams();
  const { requireAuth } = useAuth();

  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
        priceRange: partner.priceRange || null,
        specsOrRiders: partner.specsOrRiders || [],
        description: partner.description || '',
        completedGigs: partner.completedGigs || 0,
      });
    }, `Ingin mengajak ${partner.name} berkolaborasi? Masuk akun dulu agar pengajuan resmi langsung terkirim.`);
  };

  const isVendor = partner?.type === 'VENDOR';
  const isTalent = partner?.type === 'TALENT';

  const packages = partner?.packages || [];
  const talentProfile = partner?.talentProfile;

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
  const backLabel = isVendor ? t('pd.backV') : isTalent ? t('pd.backT') : t('pd.backO');
  const ctaLabel = isVendor ? t('pd.ctaV') : isTalent ? t('pd.ctaT') : t('pd.ctaO');
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

  if (!partner) {
    return <EmptyState title={t('pd2.01')} body="Profil ini mungkin sudah tidak aktif." actionLabel="Lihat direktori mitra" actionTo="/vendors" />;
  }

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
          {t('pd2.02')}
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
                {partner.verified && <CheckCircle2 aria-label={t('pd2.03')} className="h-7 w-7 shrink-0 text-brand-lime" />}
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
            <CardTitle icon={<FileText className="h-5 w-5" />}>{t('pd2.04')}</CardTitle>
            <p className="text-base leading-7 text-slate-700">
              {partner.description || t('pd.noDesc')}
            </p>
            <dl className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
              <Fact
                label={t('pd2.05')}
                value={
                  partner.verified ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                      {t('pd.kycPass')}
                    </span>
                  ) : (
                    t('pd.unverified')
                  )
                }
              />
              <Fact label={t('pd2.06')} value={String(partner.completedGigs || 0)} />
              <Fact label={t('pd2.07')} value="Pencairan bertahap" />
            </dl>
          </Card>

          {isVendor && (
            <>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle icon={<Wrench className="h-5 w-5" />}>{t('pd2.08')}</CardTitle>
                </div>

                {packages.length > 0 ? (
                  <div className="space-y-4">
                    {packages.map((pkg: any) => (
                      <div key={pkg.id} className="space-y-4 rounded-lg bg-brand-cream p-5">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                          <h3 className="font-display text-xl font-extrabold tracking-[-0.02em] text-brand-ink">{pkg.package_name}</h3>
                          <span className="font-display text-xl font-extrabold text-brand-ink">
                            Rp {Number(pkg.base_price).toLocaleString('id-ID')}
                            <span className="text-sm font-normal text-slate-600"> {t("pd2.day")}</span>
                          </span>
                        </div>

                        {pkg.tech_specs && (
                          <div className="space-y-2 rounded-lg bg-white p-4 text-base">
                            <p className="text-sm font-semibold text-slate-800">{t('pd2.10')}</p>
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
                            {t('pd2.11')}
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
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <div data-gsap-reveal className="space-y-3 rounded-lg bg-brand-navy p-6 text-white sm:p-8">
                <p className="flex items-center gap-2 font-display text-xl font-extrabold">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5 text-brand-lime" />
                  {t('pd2.12')}
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
                  <CardTitle icon={<Volume2 className="h-5 w-5" />}>{t('pd2.13')}</CardTitle>
                  <span className="rounded-full bg-brand-lime-soft px-3 py-1 text-sm font-semibold text-brand-navy">
                    {talentProfile?.genre ? t('pd.genre') + ' ' + talentProfile.genre : ''}
                  </span>
                </div>

                {talentProfile?.technical_riders ? (
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {talentProfile.technical_riders.channels && (
                      <Fact label={t('pd2.14')} value={talentProfile.technical_riders.channels + ' channel'} />
                    )}
                    {talentProfile.technical_riders.monitors && <Fact label={t('pd2.15')} value={String(talentProfile.technical_riders.monitors)} />}
                    {talentProfile.technical_riders.amps && <Fact wide label={t('pd2.16')} value={String(talentProfile.technical_riders.amps)} />}
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

              {talentProfile?.hospitality_riders && typeof talentProfile.hospitality_riders === 'object' && Object.keys(talentProfile.hospitality_riders).length > 0 && (
                <Card>
                  <CardTitle icon={<Users className="h-5 w-5" />}>{t('pd2.17')}</CardTitle>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {talentProfile.hospitality_riders.rooms && <Fact label={t('pd2.18')} value={String(talentProfile.hospitality_riders.rooms)} />}
                    {talentProfile.hospitality_riders.meals && <Fact label={t('pd2.19')} value={String(talentProfile.hospitality_riders.meals)} />}
                    {talentProfile.hospitality_riders.transfers && <Fact label={t('pd2.20')} value={String(talentProfile.hospitality_riders.transfers)} />}
                  </dl>
                </Card>
              )}

              <div data-gsap-reveal className="space-y-3 rounded-lg bg-brand-navy p-6 text-white sm:p-8">
                <p className="flex items-center gap-2 font-display text-xl font-extrabold">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5 text-brand-lime" />
                  {t('pd2.21')}
                </p>
                <p className="text-base leading-7 text-slate-200">
                  {t('pd2.22')}
                </p>
              </div>
            </>
          )}

        </div>

        <aside>
          <div data-gsap-reveal className="sticky top-24 space-y-6 rounded-lg bg-white p-6 sm:p-8">
            <div>
              <p className="text-sm text-slate-700">{t('pd2.23')}</p>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-ink">
                {partner.priceRange || t('pd.negotiable')}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t('pd2.24')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleProposeClick}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-6 text-base font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
            >
              <Send aria-hidden="true" className="h-5 w-5 text-brand-lime" />
              {isVendor ? t('pd.btnV') : isTalent ? t('pd.btnT') : t('pd.btnO')}
            </button>

            <ul className="space-y-3 border-t border-slate-200 pt-5 text-base text-slate-700">
              <li className="flex items-start gap-3">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest" />
                {t('pd.depositNote')}
              </li>
              <li className="flex items-start gap-3">
                <FileText aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-forest" />
                {t('pd2.25')}
              </li>
            </ul>

            {(contactPhone || contactEmail) && (
              <div className="space-y-2 rounded-lg bg-brand-cream p-4">
                <p className="text-sm font-semibold text-slate-800">{t('pd2.26')}</p>
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
