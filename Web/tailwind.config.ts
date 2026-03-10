import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // LXGW WenKai / 霞鹜文楷 - https://github.com/lxgw/LxgwWenKai
        sans: ['"LXGW WenKai"', ...defaultTheme.fontFamily.sans],
        mono: ['"LXGW WenKai Mono"', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        // 深邃星空配色
        'deep-space': {
          DEFAULT: '#0c0118',
          '50': '#1a0a2e',
          '100': '#16082a',
          '200': '#0d0619',
        },
        'cosmic-purple': {
          DEFAULT: '#7c3aed',
          'light': '#a855f7',
          'dark': '#5b21b6',
        },
      },
      animation: {
        'blob': 'blob 15s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} as Config;

export default config;
