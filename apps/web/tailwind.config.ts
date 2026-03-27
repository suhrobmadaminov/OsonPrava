import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        duo: {
          green: '#58CC02',
          'green-dark': '#4CAD01',
          blue: '#1CB0F6',
          red: '#FF4B4B',
          purple: '#CE82FF',
          yellow: '#FFC800',
          orange: '#FF9600',
        },
        dark: {
          bg: '#131F24',
          card: '#1A2C35',
          border: '#2B3F4A',
          text: '#E5E5E5',
          muted: '#8B9DAF',
        },
      },
      fontFamily: {
        nunito: ['var(--font-nunito)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
