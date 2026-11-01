import { useLanguage } from '../../../context/LanguageContext';
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
    <section
      aria-labelledby="home-flow-title"
      data-gsap-reveal
      className="bg-brand-ink px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14"
    >
      <SectionHeading
        id="home-flow-title"
        title={t('flow.title')}
        description={t('flow.desc')}
        inverse
      />
      <ol className="mt-10 grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ title, description }) => (
          <li key={title} className="flex flex-col items-start">
            <span aria-hidden="true" className="mb-5 h-1.5 w-12 bg-brand-lime" />
            <h3 className="text-lg font-semibold leading-snug text-white">{title}</h3>
            <p className="mt-3 text-base leading-7 text-slate-300">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
