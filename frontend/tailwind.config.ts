import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#080c0b",
        panel: "#0f1513",
        surface: "#141c19",
        accent: "#5eead4",
        "accent-dim": "#2dd4bf",
        reuse: "#a78bfa",
        danger: "#f87171",
        success: "#4ade80",
      },
      boxShadow: {
        panel: "0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        "glow-sm": "0 0 20px rgba(94, 234, 212, 0.15)",
        "glow-reuse": "0 0 20px rgba(167, 139, 250, 0.2)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
