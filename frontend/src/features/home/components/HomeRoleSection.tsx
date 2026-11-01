import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import SectionHeading from './SectionHeading';

interface Props {
  onOpenCreateEvent: () => void;
}

export default function HomeRoleSection({ onOpenCreateEvent }: Props) {
  const { t } = useLanguage();
  const roles = [
    {
      id: 'eo',
      title: t('pillars.eo.title'),
      description: t('pillars.eo.desc'),
      cta: t('pillars.eo.cta'),
      href: null,
    },
    {
      id: 'vendor',
      title: t('pillars.vendor.title'),
      description: t('pillars.vendor.desc'),
      cta: t('pillars.vendor.cta'),
      href: '/vendors',
    },
    {
      id: 'talent',
      title: t('pillars.talent.title'),
      description: t('pillars.talent.desc'),
      cta: t('pillars.talent.cta'),
      href: '/bands',
    },
    {
      id: 'tenant',
      title: t('pillars.tenant.title'),
      description: t('pillars.tenant.desc'),
      cta: t('pillars.tenant.cta'),
      href: '/events',
    },
    {
      id: 'sponsor',
      title: t('pillars.sponsor.title'),
      description: t('pillars.sponsor.desc'),
      cta: t('pillars.sponsor.cta'),
      href: '/sponsors',
    },
    {
      id: 'crew',
      title: t('pillars.crew.title'),
      description: t('pillars.crew.desc'),
      cta: t('pillars.crew.cta'),
      href: '/events',
    },
  ];

  return (
    <section aria-labelledby="home-roles-title" data-gsap-reveal className="space-y-9">
      <SectionHeading
        id="home-roles-title"
        title={t('pillars.title')}
        description={t('pillars.desc')}
        action={
          <Link
            to="/panduan-role"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            {t('pillars.allGuide')}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        }
      />

      <ul className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
        {roles.map(({ id, title, description, cta, href }) => (
          <li key={id} data-gsap-reveal className="flex min-h-48 flex-col items-start">
            <h3 className="max-w-[22ch] text-xl font-semibold leading-snug tracking-[-0.02em] text-slate-950">
              {title}
            </h3>
            <p className="mt-3 flex-1 text-base leading-7 text-slate-600">{description}</p>
            {href ? (
              <Link
                to={href}
                className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              >
                {cta}
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onOpenCreateEvent}
                className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              >
                {cta}
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
