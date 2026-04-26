import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ov: {
          bg: '#06060f',
          surface: '#0d0d1a',
          card: '#12121f',
          elevated: '#1a1a2e',
          border: '#252540',
          'border-bright': '#3a3a60',
          green: '#00e87a',
          'green-dim': '#00b85f',
          'green-glow': 'rgba(0,232,122,0.15)',
          purple: '#7c3aed',
          'purple-dim': '#5b21b6',
          cyan: '#22d3ee',
          amber: '#f59e0b',
          red: '#ef4444',
          text: '#eeeeff',
          muted: '#7878a0',
          faint: '#3a3a5c',
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.03)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,232,122,0.12), transparent)',
      },
      animation: {
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'green-glow': '0 0 20px rgba(0,232,122,0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)',
      },
    },
  },
  plugins: [],
};

export default config;
