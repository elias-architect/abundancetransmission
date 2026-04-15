import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep:    "#050810",
        navy:    "#0a0f1e",
        border:  "#1a2640",
        accent:  "#3b82f6",
        gold:    "#f59e0b",
        teal:    "#06b6d4",
        emerald: "#10b981",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Segoe UI", "sans-serif"],
        serif: ["Georgia", "Cambria", "serif"],
      },
      animation: {
        "float":       "float 6s ease-in-out infinite",
        "glow-pulse":  "glowPulse 3s ease-in-out infinite",
        "fade-in-up":  "fadeInUp 0.8s ease forwards",
        "shimmer":     "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-12px)" },
        },
        glowPulse: {
          "0%,100%": { opacity: "0.6" },
          "50%":     { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gold-shimmer": "linear-gradient(90deg,#f59e0b 0%,#fde68a 40%,#f59e0b 80%,#d97706 100%)",
        "water-gradient": "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.12) 0%, transparent 70%)",
        "deep-gradient": "linear-gradient(180deg, #050810 0%, #060d1e 50%, #050810 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
