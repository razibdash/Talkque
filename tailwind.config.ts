import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f4ef',
          100: '#c2e8d8',
          500: '#0d7a57',
          600: '#0a684a',
          700: '#07543c',
        },
        ink: {
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
        },
        sidebar: '#1e1e2e',
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
