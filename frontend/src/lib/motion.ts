import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

// One house ease: a long, soft landing (close to easeOutExpo). Everything that
// enters the page uses it, so the whole site moves with the same character.
CustomEase.create('ey', 'M0,0 C0.16,1 0.3,1 1,1');

/** Run motion only for visitors who have not asked for less of it. */
export const NO_REDUCED_MOTION = '(prefers-reduced-motion: no-preference)';

export { gsap, ScrollTrigger, SplitText };
