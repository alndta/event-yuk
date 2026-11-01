import { Plus } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import Band from './Band';
import SectionHeading from './SectionHeading';

// Copied from the role guide page so both pages say the same thing.
const faqs = [
  {
    role: 'Penyelenggara',
    q: 'Apakah EO bisa membatasi pengajuan proposal dari pihak luar?',
    a: 'Ya, EO memiliki opsi toggle "Izinkan Penawaran Vendor Terbuka", "Izinkan Proposal Band Terbuka", atau mode "Khusus Undangan (Invite-Only)".',
  },
  {
    role: 'Penyelenggara',
    q: 'Bagaimana mekanisme pengembalian dana (refund) jika terjadi pembatalan?',
    a: 'Jika terjadi pembatalan sepihak sebelum instalasi alat, sistem Escrow secara otomatis memproses pengembalian dana sesuai klausul PKS yang disepakati.',
  },
  {
    role: 'Band',
    q: 'Bagaimana jika EO tidak menyediakan sound system sesuai technical riders?',
    a: 'Manajemen band berhak mengajukan penyesuaian atau klaim arbitrase sesuai klausul riders pada dokumen PKS digital.',
  },
  {
    role: 'Tenant',
    q: 'Apakah fasilitas listrik dan tenda sudah termasuk biaya sewa?',
    a: 'Rincian fasilitas daya watt listrik, meja, dan tenda dicantumkan transparan pada masing-masing spesifikasi kaveling booth.',
  },
  {
    role: 'Kru',
    q: 'Apakah saya bisa melamar 2 posisi kru di hari yang sama?',
    a: 'Hanya bisa jika jam shift keduanya tidak bertabrakan dan berada di lokasi yang memungkinkan perpindahan.',
  },
];

// English text says the same thing as the Indonesian answers above; nothing is added.
const faqsEn = [
  {
    role: 'Organizer',
    q: 'Can an organizer limit proposals from outside parties?',
    a: 'Yes. An organizer can switch on "Allow open vendor offers" or "Allow open band proposals", or use invite-only mode.',
  },
  {
    role: 'Organizer',
    q: 'How does a refund work if the event is cancelled?',
    a: 'If one side cancels before equipment is installed, the Escrow system automatically processes a refund according to the agreed PKS clauses.',
  },
  {
    role: 'Band',
    q: 'What if the organizer does not provide the sound system listed in the technical rider?',
    a: 'The band management can ask for an adjustment or file an arbitration claim under the rider clauses of the digital PKS.',
  },
  {
    role: 'Tenant',
    q: 'Are electricity and a tent included in the booth rent?',
    a: 'Power (watts), table, and tent details are listed openly in each booth specification.',
  },
  {
    role: 'Crew',
    q: 'Can I apply for two crew positions on the same day?',
    a: 'Only if the two shifts do not overlap and the locations allow you to travel between them.',
  },
];

export default function HomeFaqSection() {
  const { language } = useLanguage();
  const items = language === 'en' ? faqsEn : faqs;
  return (
    <Band tone="bg-brand-cream">
      <section aria-labelledby="home-faq-title" data-gsap-reveal className="space-y-12">
        <SectionHeading
          id="home-faq-title"
          align="center"
          title={language === 'en' ? 'Common questions' : 'Pertanyaan umum'}
          description={language === 'en' ? 'Answers for organizers, bands, tenants, and crew.' : 'Jawaban untuk penyelenggara, band, tenant, dan kru.'}
        />
        <div className="mx-auto max-w-3xl divide-y divide-brand-navy/15 border-y border-brand-navy/15">
          {items.map(({ role, q, a }, index) => (
            <details key={q} data-gsap-reveal open={index === 0} className="group py-1">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block text-sm font-semibold text-brand-lime-strong">{role}</span>
                  <span className="mt-1 block font-display text-lg font-bold leading-snug tracking-[-0.02em] text-brand-ink sm:text-xl">
                    {q}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-navy text-brand-navy transition-transform group-open:rotate-45"
                >
                  <Plus className="h-5 w-5" />
                </span>
              </summary>
              <p className="max-w-[60ch] pb-6 text-base leading-7 text-slate-700">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </Band>
  );
}
