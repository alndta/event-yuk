import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, NO_REDUCED_MOTION } from '../../../lib/motion';
import { useLanguage } from '../../../context/LanguageContext';

const ROLE_KEYS = [
  'pillars.eo.label',
  'pillars.vendor.label',
  'pillars.talent.label',
  'pillars.tenant.label',
  'pillars.sponsor.label',
  'pillars.crew.label',
] as const;

/**
 * A band of oversized type that drifts sideways, and speeds up while the page
 * is being scrolled. Decorative: the same words are already on the page.
 */
export default function HomeMarquee() {
  const { t } = useLanguage();
  const bandRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const words = ROLE_KEYS.map((k) => t(k));

  useLayoutEffect(() => {
    const band = bandRef.current;
    const track = trackRef.current;
    if (!band || !track) return;
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCED_MOTION, () => {
      const drift = gsap.to(track, { xPercent: -50, ease: 'none', duration: 38, repeat: -1 });
      ScrollTrigger.create({
        trigger: band,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = Math.min(Math.abs(self.getVelocity()) / 260, 5);
          gsap.to(drift, { timeScale: 1 + boost, duration: 0.25, overwrite: true });
          gsap.to(drift, { timeScale: 1, duration: 1.2, delay: 0.2, overwrite: false });
        },
      });
    });
    return () => mm.revert();
  }, []);

  const run = (suffix: string) => (
    <div className="flex shrink-0 items-center gap-10 pr-10" key={suffix}>
      {words.map((w, i) => (
        <span key={suffix + i} className="flex items-center gap-10">
          {w}
          <span aria-hidden="true" className="h-[0.28em] w-[0.28em] rotate-45 bg-brand-navy" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={bandRef}
      aria-hidden="true"
      className="-mx-5 overflow-hidden bg-brand-lime py-8 text-brand-navy sm:-mx-8 sm:py-10 lg:-mx-12 2xl:-mx-16"
    >
      <div
        ref={trackRef}
        className="flex w-max whitespace-nowrap font-display text-[clamp(3rem,8.5vw,8rem)] font-extrabold uppercase leading-none tracking-[-0.04em]"
      >
        {run('a')}
        {run('b')}
      </div>
    </div>
  );
}
