import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#E8F8EE",
          100: "#D1F1DD",
          200: "#A3E3BB",
          300: "#75D599",
          400: "#1ED760",
          500: "#1DB954",
          600: "#169C46",
          700: "#12803A",
          800: "#0E642E",
          900: "#0A4822",
        },
        surface: {
          50: "#181818",
          100: "#1E1E1E",
          200: "#282828",
          300: "#2F2F2F",
          400: "#535353",
          500: "#6A6A6A",
          600: "#B3B3B3",
          700: "#D1D1D1",
          800: "#E0E0E0",
          900: "#FFFFFF",
        },
        canvas: {
          page: "#121212",
          panel: "#181818",
          hover: "#282828",
          border: "#2F2F2F",
        },
        "text-primary": "#FFFFFF",
        "text-secondary": "#B3B3B3",
      },
      fontFamily: {
        sans: ["Circular Std", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'h4': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-l': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-m': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-s': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      borderRadius: {
        'btn-lg': '24px',
        'btn-md': '20px',
        'btn-sm': '16px',
        'btn-icon': '50%',
      },
      width: {
        'btn-icon': '40px',
      },
      height: {
        'btn-lg': '48px',
        'btn-md': '40px',
        'btn-sm': '32px',
        'btn-icon': '40px',
      },
    },
  },
  plugins: [],
} satisfies Config;