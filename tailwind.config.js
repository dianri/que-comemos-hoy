/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(-3%)' },
          '50%': { transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'pulse-subtle': {
          '0%, 15%': { transform: 'scale(1)', opacity: '0.95', boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
          '30%': { transform: 'scale(1.08)', opacity: '1', boxShadow: '0 0 14px 2px rgba(255, 255, 255, 0.65)', borderColor: 'rgba(255, 255, 255, 0.6)' },
          '45%': { transform: 'scale(1.02)', opacity: '0.97', boxShadow: '0 0 4px rgba(255, 255, 255, 0.25)' },
          '60%': { transform: 'scale(1.06)', opacity: '1', boxShadow: '0 0 10px 1px rgba(255, 255, 255, 0.45)', borderColor: 'rgba(255, 255, 255, 0.5)' },
          '75%, 100%': { transform: 'scale(1)', opacity: '0.95', boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
        },
      },
      animation: {
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-subtle': 'pulse-subtle 2.6s ease-in-out 3',
      }
    },
  },
  plugins: [],
}
