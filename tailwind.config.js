/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Lora', 'serif'],
      },
      colors: {
        vintage: {
          50: '#f9f7f4',
          100: '#f0ebe3',
          200: '#e4dac7',
          300: '#d4c4a8',
          400: '#c0a882',
          500: '#a88d62',
          600: '#8b7355',
          700: '#6d5a45',
          800: '#584a3a',
          900: '#483d31',
          950: '#2a231c',
        },
        sepia: {
          50: '#fdfcfa',
          100: '#f8f4ed',
          200: '#f0e8d8',
          300: '#e4d5ba',
          400: '#d4bb93',
          500: '#c19e6f',
          600: '#a97f54',
          700: '#8d6746',
          800: '#74553d',
          900: '#604735',
          950: '#35261c',
        },
        coffee: {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#ede0d3',
          300: '#e0cab5',
          400: '#d2b48c',
          500: '#c19a6b',
          600: '#a0522d',
          700: '#8b4513',
          800: '#6f3609',
          900: '#5d2f08',
          950: '#4a2507',
        },
        cream: {
          50: '#fffef7',
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fcd34d',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float-delayed 2.5s ease-in-out infinite',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        'fade-in': 'fade-in 1s ease-out',
        'fade-in-delayed': 'fade-in-delayed 1s ease-out 0.3s both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-delayed': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
