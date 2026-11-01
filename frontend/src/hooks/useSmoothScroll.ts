import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from '../lib/motion';

/**
 * Inertial wheel scrolling for desktop, wired into GSAP's ticker so ScrollTrigger
 * stays in sync. Touch devices and reduced-motion visitors keep native scrolling.
 * Anything with role="dialog" or data-lenis-prevent scrolls natively, and the
 * menu can pause it by dispatching `ey:scroll-lock`.
 */
export default function useSmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      prevent: (node: Element) => !!node.closest?.('[role="dialog"], [data-lenis-prevent]'),
    });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const lock = (e: Event) => {
      if ((e as CustomEvent<boolean>).detail) lenis.stop();
      else lenis.start();
    };
    window.addEventListener('ey:scroll-lock', lock);

    return () => {
      window.removeEventListener('ey:scroll-lock', lock);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}
