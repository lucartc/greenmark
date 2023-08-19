/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'primary': 'linear-gradient(#252525,#252525)',
        'primary-transparent': 'linear-gradient(rgba(255,0,0,0.2),rgba(255,0,0,0.2))',
        // 'primary-transparent': 'linear-gradient(#0b2428,#0b2428)',
        // 'primary': 'linear-gradient(#001d18ff,#00352cff)',
        'secondary': 'linear-gradient(#333333,#333333)',
        // 'secondary': 'linear-gradient(#008080ff,#008080ff)',
        'accent-1': 'linear-gradient(#001d18ff,#00352cff)',
        'accent-2': 'linear-gradient(#001d18ff,#00352cff)'
      }
    },
  },
  plugins: [],
}