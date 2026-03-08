/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        apple: {
          red: '#FC3C44',
          pink: '#FA2D48',
          bg: '#1C1C1E',
          surface: '#2C2C2E',
          elevated: '#3A3A3C',
          text: '#F5F5F7',
          secondary: '#A1A1A6',
          border: '#38383A',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
