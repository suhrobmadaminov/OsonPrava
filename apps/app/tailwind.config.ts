import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
        // Expressive palette
        expressive: {
          primary: '#6366F1',      // Indigo
          'primary-dark': '#4F46E5',
          secondary: '#EC4899',    // Pink
          accent: '#06B6D4',       // Cyan
          success: '#10B981',      // Emerald
          warning: '#F59E0B',      // Amber
          danger: '#EF4444',       // Red
          surface: '#F8FAFC',
          'surface-dark': '#0F172A',
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
        nunito: ['Nunito', 'sans-serif'],
        // Expressive typography
        display: ['Inter', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      // Expressive gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
        'gradient-warning': 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #6366F1 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #06B6D4 0%, #1CB0F6 50%, #6366F1 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #6366F1 100%)',
      },
      // Expressive shadows
      boxShadow: {
        'expressive-sm': '0 2px 8px 0 rgba(99, 102, 241, 0.08)',
        'expressive': '0 4px 16px 0 rgba(99, 102, 241, 0.12)',
        'expressive-lg': '0 8px 32px 0 rgba(99, 102, 241, 0.16)',
        'expressive-xl': '0 16px 48px 0 rgba(99, 102, 241, 0.20)',
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-secondary': '0 0 20px rgba(236, 72, 153, 0.4)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.4)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
      },
      // Expressive animations
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.8)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
