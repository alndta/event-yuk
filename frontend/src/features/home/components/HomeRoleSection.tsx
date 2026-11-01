import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import Band from './Band';
import SectionHeading from './SectionHeading';

interface Props {
  onOpenCreateEvent: () => void;
}

const linkClass =
  "mt-5 inline-flex min-h-11 items-center gap-2 text-base font-semibold underline decoration-2 underline-offset-8 after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

export default function HomeRoleSection({ onOpenCreateEvent }: Props) {
  const { t } = useLanguage();
  const roles = [
    { id: 'eo', photo: 'contract-handshake.jpg', tone: 'bg-brand-lime text-brand-ink', href: null },
    { id: 'vendor', photo: 'vendor-sound.jpg', tone: 'bg-brand-navy text-white', href: '/vendors' },
    { id: 'talent', photo: 'band-rock.jpg', tone: 'bg-brand-sand text-brand-ink', href: '/bands' },
    { id: 'tenant', photo: 'tenant-bazaar.jpg', tone: 'bg-brand-forest-light text-brand-ink', href: '/events' },
    { id: 'sponsor', photo: 'sponsor-activation.jpg', tone: 'bg-brand-cream text-brand-ink', href: '/sponsors' },
    { id: 'crew', photo: 'vendor-lighting.jpg', tone: 'bg-brand-forest text-white', href: '/events' },
  ] as const;

  return (
    <Band tone="bg-brand-clay">
      <section aria-labelledby="home-roles-title" data-gsap-reveal className="space-y-12">
        <SectionHeading
          id="home-roles-title"
          align="center"
          title={t('pillars.title')}
          description={t('pillars.desc')}
          action={
            <Link
              to="/panduan-role"
              className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-brand-navy underline decoration-2 underline-offset-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
            >
              {t('pillars.allGuide')}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          }
        />

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {roles.map(({ id, photo, tone, href }) => {
            const cta = t(('pillars.' + id + '.cta') as 'pillars.eo.cta');
            return (
              <li key={id} data-gsap-reveal className={'relative flex flex-col overflow-hidden rounded-lg ' + tone}>
                <img
                  src={'/assets/' + photo}
                  alt=""
                  width={800}
                  height={560}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[10/7] w-full object-cover"
                />
                <div className="flex flex-1 flex-col items-start p-6 sm:p-7">
                  <h3 className="font-display text-2xl font-extrabold leading-tight tracking-[-0.03em]">
                    {t(('pillars.' + id + '.title') as 'pillars.eo.title')}
                  </h3>
                  <p className="mt-3 flex-1 text-base leading-7 opacity-90">
                    {t(('pillars.' + id + '.desc') as 'pillars.eo.desc')}
                  </p>
                  {href ? (
                    <Link to={href} className={linkClass}>
                      {cta}
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  ) : (
                    <button type="button" onClick={onOpenCreateEvent} className={linkClass}>
                      {cta}
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </Band>
  );
}
