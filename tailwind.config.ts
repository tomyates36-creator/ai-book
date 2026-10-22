import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "oklch(24.3% .019 62.5)",
        paper: "oklch(94.3% .031 89.2)",
        punch: "oklch(60% .199 27.8)",
        sun: "oklch(81.5% .135 79.6)",
        leaf: "oklch(44% .071 162.5)",
        muted: "oklch(90% .028 88)",
      },
      fontFamily: {
        display: ['"Archivo Black"', "system-ui", "sans-serif"],
        body: ["Archivo", "system-ui", "sans-serif"],
        hand: ["Caveat", "cursive"],
      },
    },
  },
  plugins: [],
} satisfies Config;
