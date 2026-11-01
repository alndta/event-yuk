import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

interface Props {
  title: string;
  body?: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

const buttonClass =
  'mt-6 inline-flex min-h-12 items-center rounded-full bg-brand-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy';

/** Shown when a list has nothing to show, or an item no longer exists. */
export default function EmptyState({ title, body, icon, actionLabel, actionTo, onAction }: Props) {
  return (
    <div role="status" className="ey-fade-in mx-auto max-w-lg rounded-2xl bg-white px-6 py-14 text-center">
      <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-lime-soft text-brand-navy">
        {icon ?? <SearchX aria-hidden="true" className="h-7 w-7" />}
      </span>
      <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-brand-ink">{title}</h2>
      {body && <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-slate-600">{body}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className={buttonClass}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" onClick={onAction} className={buttonClass}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
