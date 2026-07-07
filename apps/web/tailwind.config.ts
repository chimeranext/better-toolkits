import type { Config } from "tailwindcss";

// Theme inherited from better-microservices/apps/web (Chimera brand).
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        // Chimera brand (raw hues for gradients/pills)
        brand: { primary: "#7C5CFF", secondary: "#3B82F6", tertiary: "#22D3EE", accent: "#EC4899" },
      },
      fontFamily: { heading: ["var(--font-sora)"], body: ["var(--font-inter)"], mono: ["var(--font-mono)"] },
      borderRadius: { lg: "10px", md: "8px", sm: "6px" },
      backgroundImage: { "brand-gradient": "linear-gradient(90deg,#7C5CFF,#3B82F6,#22D3EE)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
