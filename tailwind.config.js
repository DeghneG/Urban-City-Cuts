/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0a0a0a',
          2: '#111214',
          3: '#1a1b1e',
        },
        line: '#26282c',
        chrome: {
          DEFAULT: '#b8bec5',
          light: '#e6e9ec',
          dark: '#7d838a',
        },
        bone: '#f2f3f4',
        gold: '#c9a45c',
        muted: '#8b9096',
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'sans-serif'],
        display: ['Archivo', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
}
