import { useLayoutEffect } from 'react';
import { gsap, NO_REDUCED_MOTION } from '../lib/motion';

interface ElementRef {
  current: HTMLElement | null;
}

/**
 * Plays an entrance on first render and again whenever `key` changes (a tab, a
 * wizard step). Targets are the elements marked [data-enter] inside the ref;
 * if none are marked, the ref's direct children are used.
 */
export default function useEnter(ref: ElementRef, key: unknown = 0) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCED_MOTION, () => {
      const marked = Array.from(root.querySelectorAll<HTMLElement>('[data-enter]'));
      const targets = marked.length ? marked : Array.from(root.children) as HTMLElement[];
      const tween = gsap.from(targets, {
        y: 36,
        opacity: 0,
        duration: 1,
        ease: 'ey',
        stagger: 0.07,
        clearProps: 'transform,opacity',
      });
      return () => {
        tween.kill();
        gsap.set(targets, { clearProps: 'transform,opacity' });
      };
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
