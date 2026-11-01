import { Link } from 'react-router-dom';

interface Props {
  title: string;
  body?: string;
  actionLabel?: string;
  actionTo?: string;
}

/** Shown when the server has nothing to list, or an item no longer exists. */
export default function EmptyState({ title, body, actionLabel, actionTo }: Props) {
  return (
    <div role="status" className="mx-auto max-w-lg rounded-2xl bg-white px-6 py-14 text-center">
      <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-brand-ink">{title}</h2>
      {body && <p className="mt-3 text-base leading-7 text-slate-600">{body}</p>}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand-navy px-6 text-sm font-semibold text-white hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
