/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light:      "hsl(var(--primary-light))",
          dark:       "hsl(var(--primary-dark))",
        },
        secondary:   { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))",     foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))",    foreground: "hsl(var(--accent-foreground))" },
        card:        { DEFAULT: "hsl(var(--card))",      foreground: "hsl(var(--card-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        success:     { DEFAULT: "hsl(var(--success))",   foreground: "hsl(var(--success-foreground))" },
        warning:     { DEFAULT: "hsl(var(--warning))",   foreground: "hsl(var(--warning-foreground))" },
        // Admin specific
        admin: { bg: "hsl(var(--admin-bg))", sidebar: "hsl(var(--admin-sidebar))", nav: "hsl(var(--admin-nav))" },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      keyframes: {
        "fade-in":     { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "fade-in-up":  { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "slide-right": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        "scale-in":    { from: { opacity: 0, transform: "scale(0.95)" }, to: { opacity: 1, transform: "scale(1)" } },
        "pulse-ring":  { "0%": { transform: "scale(0.8)", opacity: 1 }, "100%": { transform: "scale(2)", opacity: 0 } },
        "shimmer":     { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "bounce-in":   { "0%": { transform: "scale(0.3)", opacity: 0 }, "50%": { transform: "scale(1.1)" }, "100%": { transform: "scale(1)", opacity: 1 } },
        "count-up":    { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        "fade-in":     "fade-in 0.3s ease-out",
        "fade-in-up":  "fade-in-up 0.4s ease-out",
        "slide-right": "slide-right 0.3s ease-out",
        "scale-in":    "scale-in 0.2s ease-out",
        "pulse-ring":  "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "shimmer":     "shimmer 2s linear infinite",
        "bounce-in":   "bounce-in 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
        "count-up":    "count-up 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
