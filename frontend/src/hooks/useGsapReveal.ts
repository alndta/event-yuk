import { useEffect } from 'react';

interface ElementRef {
  current: HTMLElement | null;
}

export default function useGsapReveal(
  rootRef: ElementRef,
  selector = '[data-gsap-reveal]'
) {
  useEffect(() => {
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    let media: { revert: () => void } | undefined;

    void import('gsap')
      .then(({ gsap }) => {
        const root = rootRef.current;
        if (cancelled || !root) return;

        const matchMedia = gsap.matchMedia(root);
        media = matchMedia;
        matchMedia.add('(prefers-reduced-motion: no-preference)', () => {
          const targets = gsap.utils.toArray<HTMLElement>(selector, root);
          if (targets.length === 0) return;

          gsap.set(targets, { autoAlpha: 0, y: 16 });
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                gsap.to(entry.target, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.48,
                  ease: 'power2.out',
                  overwrite: true,
                });
                observer?.unobserve(entry.target);
              });
            },
            { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }
          );

          targets.forEach((target) => observer?.observe(target));
          return () => observer?.disconnect();
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      observer?.disconnect();
      media?.revert();
    };
  }, [rootRef, selector]);
}
