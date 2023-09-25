/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'primary': 'linear-gradient(#0D2226,#205560)',
        'card': 'url(../public/greenmark_illustration_3.svg),linear-gradient(90deg,rgba(0,0,0,0.8),rgba(0,0,0,0.0))',
        'primary-transparent': 'linear-gradient(rgba(255,0,0,0.2),rgba(255,0,0,0.2))',
        // 'primary-transparent': 'linear-gradient(#0b2428,#0b2428)',
        // 'primary': 'linear-gradient(#001d18ff,#00352cff)',
        'secondary': 'linear-gradient(45deg,#052E2B,#04201E)',
        'menu-item': 'linear-gradient(#084440,#084440)',
        // 'secondary': 'linear-gradient(#008080ff,#008080ff)',
        'accent-1': 'linear-gradient(#001d18ff,#00352cff)',
        'accent-2': 'linear-gradient(#001d18ff,#00352cff)',
        'accent-3': 'linear-gradient(#2AFF78,#2AFF78)',
      }
    },
  },
  plugins: [],
}