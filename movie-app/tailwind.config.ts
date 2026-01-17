
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
        // Modern 2D Theme - Solid, Matte, Vibrant
        background: {
          DEFAULT: "#0A0A0A", // Zinc 950
          paper: "#121212",
          secondary: "#18181B", // Zinc 900
          card: "#27272A", // Zinc 800
        },
        accent: {
          primary: "#8B5CF6", // Violet 500
          secondary: "#6366F1", // Indigo 500
          hover: "#A78BFA", // Violet 400
          error: "#EF4444",
          success: "#10B981",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA", // Zinc 400
          muted: "#71717A", // Zinc 500,
          highlight: "#E4E4E7",
        },
        border: {
          DEFAULT: "#3F3F46", // Zinc 700 - Visible borders for 2D look
          subtle: "#27272A",
        },
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
        "gradient-dark": "linear-gradient(180deg, rgba(10,10,10,0) 0%, #0A0A0A 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)", // Snappier
        "scale-in": "scaleIn 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" }, // Less travel
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        }
      },
      boxShadow: {
        "flat": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "2d": "0 0 0 1px #3F3F46",
        "2d-hover": "0 0 0 2px #8B5CF6", // Border glow effect without blur
      },
    },
  },
  plugins: [],
};

export default config;
