import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        paper: "#f5f2e9",
        moss: "#2f5d45",
        lime: "#d8ef76",
        clay: "#b95d3b"
      },
      boxShadow: { card: "0 1px 0 rgba(23,33,27,.08), 0 12px 30px rgba(23,33,27,.06)" }
    }
  },
  plugins: []
} satisfies Config;
