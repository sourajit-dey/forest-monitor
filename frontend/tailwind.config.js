/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bnb: {
          primary: "#fcd535",
          "primary-active": "#f0b90b",
          "primary-disabled": "#3a3a1f",
          ink: "#181a20",
          body: "#eaecef",
          muted: "#707a8a",
          "muted-strong": "#929aa5",
          "hairline-dark": "#2b3139",
          "hairline-light": "#eaecef",
          "border-strong": "#cdd1d6",
          "canvas-dark": "#0b0e11",
          card: "#1e2329",
          elevated: "#2b3139",
          "soft-light": "#fafafa",
          "strong-light": "#f5f5f5",
          "trading-up": "#0ecb81",
          "trading-down": "#f6465d",
          info: "#3b82f6",
          "on-primary": "#181a20",
          "on-dark": "#ffffff",
        }
      },
      fontFamily: {
        sans: [
          "Outfit",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        display: ["Space Grotesk", "sans-serif"]
      },
      boxShadow: {
        'bnb-card': '0 0 0 1px rgba(43, 49, 57, 0.9)',
        'bnb-pop': '0 8px 24px rgba(0, 0, 0, 0.45)',
        'bnb-float': '0 8px 24px rgba(0, 0, 0, 0.35)',
      }
    },
  },
  plugins: [],
}