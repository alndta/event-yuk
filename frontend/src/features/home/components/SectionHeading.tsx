import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  inverse?: boolean;
}

export default function SectionHeading({
  id,
  title,
  description,
  action,
  inverse = false,
}: Props) {
  const titleClass = inverse ? 'text-white' : 'text-slate-950';
  const descriptionClass = inverse ? 'text-slate-300' : 'text-slate-600';

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
