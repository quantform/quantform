const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/**/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Proxima Nova', ...defaultTheme.fontFamily.mono]
      }
    }
  },
  plugins: []
};
