// Central motion language for the whole site.
// One signature easing curve + a small, consistent set of durations/springs
// so every transition speaks the same visual language.

// Signature expo-out curve (used by Reveal, ScrollSection, page transitions).
export const EASE = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT = [0.65, 0, 0.35, 1];

// Durations (seconds)
export const DUR = {
  fast: 0.35,
  reveal: 0.6,
  hero: 0.9,
};

// Weighted spring for scroll-linked motion values (gives motion "mass"
// instead of a mechanical 1:1 mapping to the wheel).
export const SCROLL_SPRING = { stiffness: 130, damping: 30, mass: 0.45 };

// Magnetic button spring.
export const MAGNETIC_SPRING = { stiffness: 250, damping: 18, mass: 0.5 };

// Route/page transition.
export const PAGE_TRANSITION = { duration: 0.4, ease: EASE };
