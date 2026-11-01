import type { ReactNode } from 'react';

interface Props {
  tone: string;
  children: ReactNode;
  className?: string;
}

/** Full-width colour band that cancels the page gutters, then re-centres its content. */
export default function Band({ tone, children, className = '' }: Props) {
  return (
    <div
      className={
        '-mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 2xl:-mx-16 2xl:px-16 py-16 sm:py-24 ' +
        tone +
        ' ' +
        className
      }
    >
      <div className="mx-auto max-w-[96rem]">{children}</div>
    </div>
  );
}
