import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, NO_REDUCED_MOTION } from '../lib/motion';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Behaviour shared by every overlay dialog. Put the returned ref on the fixed
 * overlay; its first child is treated as the panel.
 *   - role="dialog" and aria-modal on the panel
 *   - the backdrop fades in, the panel rises and settles, its children arrive in turn
 *   - Escape closes, Tab stays inside, focus moves in and returns on close
 *   - page scroll (and Lenis) is paused while open
 * Reduced motion skips the animation but keeps everything else.
 */
export default function useDialog<T extends HTMLElement = HTMLDivElement>(onClose: () => void, label?: string) {
  const ref = useRef<T>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useLayoutEffect(() => {
    const overlay = ref.current;
    const panel = overlay?.firstElementChild as HTMLElement | null;
    if (!overlay || !panel) return;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    if (label && !panel.getAttribute('aria-label') && !panel.getAttribute('aria-labelledby')) panel.setAttribute('aria-label', label);
    overlay.classList.remove('animate-fadeIn');

    const mm = gsap.matchMedia();
    mm.add(NO_REDUCED_MOTION, () => {
      const tl = gsap.timeline({ defaults: { ease: 'ey' } });
      tl.from(overlay, { opacity: 0, duration: 0.45, ease: 'power2.out' }, 0)
        .from(panel, { y: 56, scale: 0.96, opacity: 0, duration: 0.9 }, 0.05);
      const parts = Array.from(panel.querySelectorAll<HTMLElement>('h2, h3, form > *, p, [data-dialog-item]')).slice(0, 14);
      if (parts.length) tl.from(parts, { y: 18, opacity: 0, duration: 0.7, stagger: 0.04, clearProps: "transform,opacity" }, 0.25);
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const overlay = ref.current;
    if (!overlay) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('ey:scroll-lock', { detail: true }));
    const firstField = overlay.querySelector<HTMLElement>('input:not([type=hidden]), textarea, select');
    (firstField ?? overlay.querySelector<HTMLElement>(FOCUSABLE))?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = Array.from(overlay.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.dispatchEvent(new CustomEvent('ey:scroll-lock', { detail: false }));
      document.removeEventListener('keydown', onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  return ref;
}
