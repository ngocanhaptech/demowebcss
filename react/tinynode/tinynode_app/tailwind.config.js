/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brandYellow: '#fde047',
        brandGreen: '#4ade80',
        brandOrange: '#fb923c',
      },
    },
  },
  plugins: [],
};
