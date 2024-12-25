// // tailwind.config.js
// module.exports = {
//     content: [
//       "./src/**/*.{js,jsx,ts,tsx}",
//       "./public/index.html"
//     ],
//     theme: {
//       extend: {
//         colors: {
//           surface: {
//             DEFAULT: '#14181C',
//             light: '#1B2228',
//             lighter: '#2C3440',
//           },
//           accent: {
//             DEFAULT: '#00E054',
//             hover: '#00B344',
//           },
//           text: {
//             primary: '#FFFFFF',
//             secondary: '#9AB',
//             tertiary: '#678'
//           }
//         },
//         fontFamily: {
//           sans: ['Inter', 'system-ui', 'sans-serif'],
//         }
//       },
//     },
//     plugins: [],
//   }

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#14181c',  // Main background
          light: '#2c3440',    // Card/container background
          lighter: '#456'      // Borders, etc
        },
        text: {
          primary: '#ffffff',  // Main text
          secondary: '#9ab',   // Secondary text
          muted: '#678'       // Muted text
        },
        accent: {
          DEFAULT: '#00c030',  // Primary accent
          hover: '#00e054'     // Hover state
        }
      }
    }
  },
  plugins: []
}