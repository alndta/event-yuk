/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        warm: ['"Fraunces Variable"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          navy: '#172D46',
          'navy-dark': '#0F263B',
          'navy-light': '#375872',
          ink: '#142637',
          canvas: '#F6F8F3',
          sand: '#E9EFD9',
          cream: '#F4EDE0',
          clay: '#E5DACB',
          lime: '#D7F36A',
          'lime-hover': '#C6E64F',
          'lime-strong': '#5E7628',
          'lime-deep': '#3F531D',
          'lime-soft': '#F0F5DC',
          forest: '#456B39',
          'forest-dark': '#2F5232',
          'forest-light': '#EAF2E3',
          white: '#FFFFFF',
        },
      },
      boxShadow: {
        'glow-navy': '0 0 25px -5px rgba(23, 45, 70, 0.3)',
        'glow-lime': '0 0 25px -5px rgba(215, 243, 106, 0.4)',
        'glow-forest': '0 0 25px -5px rgba(69, 107, 57, 0.35)',
        'card-hover': '0 20px 35px -10px rgba(15, 23, 42, 0.1)',
      },
    },
  },
  plugins: [],
};
