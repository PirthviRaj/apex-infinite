import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apex: {
          black: "#000000",
          void: "#050508",
          panel: "#0a0a0f",
          glass: "rgba(255,255,255,0.04)",
          purple: "#a855f7",
          "purple-bright": "#c084fc",
          cyan: "#22d3ee",
          gold: "#fbbf24",
          muted: "#71717a",
          border: "rgba(168,85,247,0.25)",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(168,85,247,0.35)",
        "glow-cyan": "0 0 40px rgba(34,211,238,0.3)",
        "glow-gold": "0 0 30px rgba(251,191,36,0.35)",
        neural: "0 0 80px rgba(168,85,247,0.2), inset 0 0 40px rgba(34,211,238,0.05)",
      },
      backgroundImage: {
        "apex-radial":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168,85,247,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(34,211,238,0.12), transparent)",
        "glass-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(168,85,247,0.05) 100%)",
      },
      keyframes: {
        "neural-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "border-trail": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "neural-pulse": "neural-pulse 2.4s ease-in-out infinite",
        "border-trail": "border-trail 3s linear infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
