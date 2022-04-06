const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/**/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono]
      },
      fontSize: {
        tiny: [
          '.65rem',
          {
            lineHeight: '1.6rem'
          }
        ]
      }
    }
  },
  plugins: []
};
