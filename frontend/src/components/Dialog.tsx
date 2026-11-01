import type { ReactNode } from 'react';
import useDialog from '../hooks/useDialog';

interface Props {
  onClose: () => void;
  label?: string;
  children: ReactNode;
  className?: string;
}

/** Overlay for dialogs written inline in a page. The single child is the panel. */
export default function Dialog({ onClose, label, children, className = '' }: Props) {
  const ref = useDialog<HTMLDivElement>(onClose, label);
  return (
    <div ref={ref} className={'fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 ' + className}>
      {children}
    </div>
  );
}
