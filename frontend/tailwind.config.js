/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // looks for any JS/JSX files in src
    "./public/index.html"          // also checks your HTML file
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#14181C',
          light: '#1B2228',
          lighter: '#2C3440',
        },
        accent: {
          DEFAULT: '#00E054',
          hover: '#00B344',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#9AB',
          tertiary: '#678'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

