import type { Config } from "tailwindcss";

// Theme migrated to the Chimera design-system (OR/gold palette) — apps/web
// depends on CSS variables defined in src/app/globals.css.
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
        // Chimera brand (gold / violet / goldLight) — kept as CSS vars so light
        // surfaces re-tune them via `.surface-light`.
        brand: { primary: "hsl(var(--brand-primary))", secondary: "hsl(var(--brand-accent))", tertiary: "hsl(var(--brand-tertiary))", accent: "hsl(var(--brand-accent))" },
      },
      fontFamily: {
        heading: ["var(--font-display)"],
        epic: ["var(--font-epic)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: { lg: "10px", md: "8px", sm: "6px" },
      backgroundImage: { "brand-gradient": "var(--brand-gradient)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
