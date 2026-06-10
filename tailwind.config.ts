import type { Config } from "tailwindcss";

/**
 * Tokens mapped from DESIGN.md (Raycast design system).
 * Dark-only command-palette aesthetic: surface ladder, hairline borders,
 * white CTA, saturated accents reserved for illustration only.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#07080a",
        surface: {
          DEFAULT: "#0d0d0d",
          elevated: "#101111",
          card: "#121212",
        },
        hairline: {
          DEFAULT: "#242728",
          soft: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.16)",
        },
        ink: "#f4f4f6",
        body: "#d6d6d8",
        mute: "#b4b4b6",
        ash: "#8c8d8f",
        stone: "#5b5b5d",
        accent: {
          red: "#ff6161",
          yellow: "#ffc533",
          green: "#59d499",
          blue: "#57c1ff",
        },
        stripe: {
          start: "#ff5757",
          end: "#a1131a",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "16px",
      },
      maxWidth: {
        content: "1240px",
      },
      letterSpacing: {
        tightish: "-0.02em",
      },
      fontSize: {
        "display-xl": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.04", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2rem, 4.5vw, 3.5rem)", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "stripe-drift": {
          "0%, 100%": { transform: "translateX(0) skewX(-18deg)" },
          "50%": { transform: "translateX(2.5%) skewX(-18deg)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.82)" },
        },
        "tick": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 1s ease both",
        "stripe-drift": "stripe-drift 14s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "tick": "tick 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
