import type { ReactNode } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

interface Props {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  inverse?: boolean;
  align?: 'left' | 'center';
}

export default function SectionHeading({
  id,
  title,
  description,
  action,
  inverse = false,
  align = 'left',
}: Props) {
  const { language } = useLanguage();
  const titleClass = inverse ? 'text-white' : 'text-brand-ink';
  const descriptionClass = inverse ? 'text-slate-300' : 'text-slate-700';

  if (align === 'center') {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2
          key={language}
          id={id}
          data-split-title
          className={'font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-6xl ' + titleClass}
        >
          {title}
        </h2>
        {description && (
          <p className={'mt-5 max-w-2xl text-lg leading-8 ' + descriptionClass}>{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 id={id} className={'max-w-[20ch] font-display text-3xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-4xl ' + titleClass}>
          {title}
        </h2>
        {description && (
          <p className={'mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 ' + descriptionClass}>{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
