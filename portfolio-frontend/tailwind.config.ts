import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00b4d8',
          hover: '#0096c7',
          glow: 'rgba(0, 180, 216, 0.3)',
          dim: '#48cae4',
          container: '#00b4d8',
        },
        surface: {
          DEFAULT: '#14171d',
          2: '#1a1c22',
          3: '#1a1c22',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(0, 180, 216, 0.35)',
        },
        text: {
          primary: '#ffffff',
          body: '#f4f7f9',
          secondary: '#b6bec7',
          muted: '#8b939e',
        },
        success: '#2dd4a7',
        warning: '#ffc857',
        error: '#ff5470',
        info: '#48cae4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
