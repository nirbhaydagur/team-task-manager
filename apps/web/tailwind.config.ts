import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(222 47% 7%)",
        foreground: "hsl(210 40% 98%)",
        muted: "hsl(217 33% 17%)",
        "muted-foreground": "hsl(215 20% 65%)",
        border: "hsl(217 33% 20%)",
        card: "hsl(222 44% 10%)",
        primary: "hsl(176 74% 46%)",
        "primary-foreground": "hsl(222 47% 7%)",
        destructive: "hsl(0 72% 51%)",
        ring: "hsl(176 74% 46%)"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;

