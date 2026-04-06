/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        'custom-red': '#F44336',
        'custom-purple': '#9C27B0',
        'custom-blue': '#3F51B5',
        'custom-light-blue': '#2196F3',
        'custom-teal': '#009688',
        'custom-amber': '#FFC107',
        'custom-orange': '#FF5722',
        'custom-brown': '#795548',
        'custom-grey': '#607D8B',
        'custom-green': '#4CAF50',
      },
      animation: {
        'loading-bar': 'loading-bar 2s ease-in-out infinite',
      },
      keyframes: {
        'loading-bar': {
          '0%': { transform: 'scaleX(0)', 'transform-origin': 'left' },
          '50%': { transform: 'scaleX(1)', 'transform-origin': 'left' },
          '51%': { transform: 'scaleX(1)', 'transform-origin': 'right' },
          '100%': { transform: 'scaleX(0)', 'transform-origin': 'right' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
