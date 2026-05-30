/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#090b10',
        panel: '#10141d',
        line: '#252b38',
        accent: '#39d0c8',
        ember: '#ffb86b'
      }
    },
  },
  plugins: [],
};

