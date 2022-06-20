module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontSize: {
        '10xl': '9rem',
        '11xl': '10rem',
        '12xl': '11rem',
      },
      keyframes: {
        scrollY: {
          '0%': {transform: 'translateY(var(--scrollY-offset))'},
          '100%': {transform: 'translateY(-100%)'},
        },
      },
      animation: {
        scrollY: 'scrollY var(--scrollY-duration) linear infinite',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/custom-forms')],
};
