import type { Variants } from "framer-motion";

// A new tool "materializes" (grows) onto the shelf, as if the network extended.
export const materialize: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

// A reused tool pulses to signal "recalled from memory".
export const reusePulse: Variants = {
  idle: { boxShadow: "0 0 0 0 rgba(167,139,250,0)" },
  pulse: {
    boxShadow: [
      "0 0 0 0 rgba(167,139,250,0.0)",
      "0 0 0 6px rgba(167,139,250,0.25)",
      "0 0 0 0 rgba(167,139,250,0.0)",
    ],
    transition: { duration: 0.9 },
  },
};
