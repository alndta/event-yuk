import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, SplitText, NO_REDUCED_MOTION } from '../lib/motion';

interface ElementRef {
  current: HTMLElement | null;
}

/**
 * Scroll choreography for a page. Mark up elements and this does the rest:
 *   [data-gsap-reveal]   rises into place, neighbours arrive in a staggered wave
 *   [data-split-title]   headline whose lines rise out of a mask
 *   [data-parallax]      image that drifts inside its overflow-hidden parent
 *   [data-gsap-bar]      bar that fills from the left
 * Nothing runs for visitors who prefer reduced motion, and content is never
 * left hidden: anything already above the viewport is simply shown.
 */
export default function useGsapReveal(
  rootRef: ElementRef,
  selector = '[data-gsap-reveal]',
  deps: unknown[] = []
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add(NO_REDUCED_MOTION, () => {
      // 1. Block reveals. Only leaf elements animate, so a section that holds
      //    revealing cards does not also fade and double the travel.
      const leaves = gsap
        .utils.toArray<HTMLElement>(selector, root)
        .filter((el) => !el.querySelector(selector))
        .filter((el) => el.getBoundingClientRect().bottom > 0);

      gsap.set(leaves, { autoAlpha: 0, y: 64 });
      ScrollTrigger.batch(leaves, {
        start: 'top 90%',
        once: true,
        interval: 0.12,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.25, ease: 'ey', stagger: 0.12, overwrite: true }),
      });

      // 2. Headlines: each line rises from behind its own baseline.
      gsap.utils.toArray<HTMLElement>('[data-split-title]', root).forEach((el) => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'ey-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 115,
              duration: 1.2,
              ease: 'ey',
              stagger: 0.12,
              scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            }),
        });
      });

      // 3. Parallax inside a clipping parent.
      gsap.utils.toArray<HTMLElement>('[data-parallax]', root).forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
      });

      // 4. Bars fill when they arrive.
      gsap.utils.toArray<HTMLElement>('[data-gsap-bar]', root).forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 1.5,
          ease: 'ey',
          scrollTrigger: { trigger: el, start: 'top 94%', once: true },
        });
      });

      // Late layout (fonts, images) moves trigger positions; measure again.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      void document.fonts?.ready.then(refresh);
      return () => window.removeEventListener('load', refresh);
    });

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef, selector, ...deps]);
}
