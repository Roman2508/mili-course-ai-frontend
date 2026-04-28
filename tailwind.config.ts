import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17212d',
        shell: '#f2efe8',
        sand: '#d4c7ad',
        field: '#4c6b4d',
        brass: '#b7852d',
        haze: '#6c7b77',
        signal: '#e16041',
        slate: '#32424f',
      },
      boxShadow: {
        panel: '0 20px 45px rgba(23, 33, 45, 0.08)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(23,33,45,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(23,33,45,0.06) 1px, transparent 1px)',
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
