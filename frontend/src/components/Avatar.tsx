import { useState } from 'react';

interface Props {
  src?: string;
  name: string;
  className?: string;
  /** Decorative when the name is shown right next to it. */
  decorative?: boolean;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[1][0] : '')).toUpperCase();
}

export default function Avatar({ src, name, className = '', decorative = false }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : name}
        aria-hidden={decorative ? true : undefined}
        className={
          'flex shrink-0 items-center justify-center bg-brand-lime-soft font-display text-sm font-bold text-brand-navy ' +
          className
        }
      >
        {initials(name)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={decorative ? '' : name}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={'shrink-0 object-cover ' + className}
    />
  );
}
