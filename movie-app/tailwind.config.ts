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
        // Dark Magenta Theme
        background: {
          DEFAULT: "#0D0D0D",
          secondary: "#1A1A2E",
          card: "#16162A",
        },
        accent: {
          primary: "#E91E8C",
          secondary: "#9B1B8C",
          hover: "#FF2D9C",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A0A0B0",
          muted: "#6B6B7B",
        },
        border: {
          DEFAULT: "#2D2D44",
          light: "#3D3D54",
        },
      },
      backgroundImage: {
        "gradient-magenta": "linear-gradient(135deg, #E91E8C 0%, #6B1B6B 100%)",
        "gradient-dark": "linear-gradient(180deg, rgba(13,13,13,0) 0%, #0D0D0D 100%)",
        "gradient-card": "linear-gradient(180deg, rgba(22,22,42,0.8) 0%, rgba(22,22,42,1) 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(233, 30, 140, 0.3)",
        "glow-lg": "0 0 40px rgba(233, 30, 140, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
