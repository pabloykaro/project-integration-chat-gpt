/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        "background": "#d8eefe",
        "card-background": "#fffffe",
        "highlight": "#3da9fc",
        "button-text": "#fffffe",
        "stroke": "#90b4ce",
        "tertiary": "#ef4565"
      },
      fontFamily: {
        sans: 'Satoshi, sans'
      }
    },
  },
  plugins: [],
}
