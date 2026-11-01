import { useLanguage } from '../../../context/LanguageContext';
import Band from './Band';
import SectionHeading from './SectionHeading';

export default function HowItWorksSection() {
  const { t } = useLanguage();
  const steps = [
    { title: t('flow.step1.title'), description: t('flow.step1.desc') },
    { title: t('flow.step2.title'), description: t('flow.step2.desc') },
    { title: t('flow.step3.title'), description: t('flow.step3.desc') },
    { title: t('flow.step4.title'), description: t('flow.step4.desc') },
  ];

  return (
    <Band tone="bg-brand-navy">
      <section aria-labelledby="home-flow-title" data-gsap-reveal className="space-y-12">
        <SectionHeading
          id="home-flow-title"
          align="center"
          title={t('flow.title')}
          description={t('flow.desc')}
          inverse
        />
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-5">
          {steps.map(({ title, description }, index) => (
            <li key={title} data-gsap-reveal className="flex min-h-[19rem] flex-col rounded-lg bg-brand-navy-dark p-7">
              <span
                aria-hidden="true"
                className="font-display text-7xl font-extrabold leading-none tracking-[-0.05em] text-brand-lime"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-auto font-display text-2xl font-extrabold leading-tight tracking-[-0.03em] text-white">
                {title}
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-200">{description}</p>
            </li>
          ))}
        </ol>
      </section>
    </Band>
  );
}
