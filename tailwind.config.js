/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#fffaf1', 100: '#fbf4e6', 200: '#f4e8d0', 300: '#ead7b3' },
        maroon: { 50: '#fbeff2', 100: '#f5d9e0', 200: '#e6a9b9', 500: '#9a2a4c', 600: '#7b1e3a', 700: '#5b1a2e', 800: '#451323', 900: '#2e0c18' },
        saffron: { 50: '#fff6e5', 100: '#ffe7b8', 300: '#f7b955', 400: '#f0a02b', 500: '#e48a12', 600: '#c26e0a' },
        gold: { 300: '#f4d98a', 400: '#e5bd5a', 500: '#d9a441', 600: '#b8862b' },
        brown: { 400: '#a58570', 500: '#8a6d5a', 700: '#5c3d2b', 800: '#3b2417', 900: '#2a1910' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px rgba(91, 26, 46, 0.08)',
        lift: '0 12px 36px rgba(91, 26, 46, 0.14)',
      },
    },
  },
  plugins: [],
};
