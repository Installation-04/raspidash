/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',
          card:    'rgb(var(--color-bg-card) / <alpha-value>)',
          border:  'rgb(var(--color-bg-border) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          blue:    'rgb(var(--color-blue) / <alpha-value>)',
          green:   'rgb(var(--color-green) / <alpha-value>)',
          yellow:  'rgb(var(--color-yellow) / <alpha-value>)',
          red:     'rgb(var(--color-red) / <alpha-value>)',
        },
        tx: {
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          muted:   'rgb(var(--color-text-muted) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
