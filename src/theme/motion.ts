/** Shared motion tokens — keep springs light for 60 FPS on the UI thread. */
export const motion = {
  duration: {
    fast: 180,
    normal: 280,
    slow: 420,
  },
  spring: {
    snappy: { damping: 20, stiffness: 360, mass: 0.7 },
    soft: { damping: 16, stiffness: 220, mass: 0.85 },
    press: { damping: 18, stiffness: 380, mass: 0.55 },
  },
  pressScale: 0.96,
  enterDistance: 14,
} as const;

export type MotionSpring = keyof typeof motion.spring;
