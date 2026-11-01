import { useLanguage } from '../context/LanguageContext';

interface Props {
  /** Text shown beside the spinner; falls back to a translated "Loading...". */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = { sm: 'h-4 w-4', md: 'h-7 w-7', lg: 'h-10 w-10' } as const;

/** A small ring spinner. The ring inherits the text color, so it works on any surface. */
export function Spinner({ size = 'md', className = '' }: Pick<Props, 'size' | 'className'>) {
  return <span aria-hidden="true" className={`ey-spinner inline-block shrink-0 ${SIZE[size]} ${className}`} />;
}

/** Centered loading block for pages and sections that have no skeleton of their own. */
export default function LoadingState({ label, size = 'md', className = '' }: Props) {
  const { t } = useLanguage();
  return (
    <div role="status" aria-live="polite" className={`ey-fade-in flex min-h-[40vh] flex-col items-center justify-center gap-4 text-brand-navy ${className}`}>
      <Spinner size={size === 'sm' ? 'md' : 'lg'} />
      <span className="text-base font-semibold text-slate-600">{label ?? t('common.loading')}</span>
    </div>
  );
}
