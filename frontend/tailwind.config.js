/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: "#0066cc",
          "blue-focus": "#0071e3",
          "blue-dark": "#2997ff",
          ink: "#1d1d1f",
          canvas: "#ffffff",
          parchment: "#f5f5f7",
          pearl: "#fafafc",
          tile1: "#272729",
          tile2: "#2a2a2c",
          tile3: "#252527",
          black: "#000000",
          muted: "#cccccc",
          muted80: "#333333",
          muted48: "#7a7a7a",
          divider: "#f0f0f0",
          hairline: "#e0e0e0",
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Inter",
          "system-ui",
          "sans-serif"
        ],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        'apple-product': '0 20px 40px -15px rgba(0, 0, 0, 0.22)',
        'apple-card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
