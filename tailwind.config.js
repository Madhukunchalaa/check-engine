/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        ink:  { 950: '#08080A', 900: '#0A0A0B', 850: '#0E0E11', 800: '#141418', 700: '#1C1C21' },
        red:  { 500: '#E5252B', 400: '#FF3D43', 600: '#C41C22' },
        bone: { 100: '#F5F5F4', 200: '#D8D8DA', 400: '#8A8A92', 500: '#6E6E75' },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Barlow Condensed', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { ultra: '0.32em', wide2: '0.18em' },
    },
  },
  plugins: [],
}
