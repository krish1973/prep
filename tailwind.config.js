/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#faf9f6',
          100: '#f5f3ee',
          200: '#e8e5dc',
          300: '#d7d2c3',
          400: '#b8b09d',
          500: '#948a74',
          600: '#756c59',
          700: '#5c5445',
          800: '#464035',
          900: '#1c1917',
        },
        sage: {
          50: '#f2f8f5',
          100: '#e1f0e9',
          500: '#047857',
          600: '#065f46',
          700: '#064e3b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      keyframes: {
        flyIntoBag: {
          '0%': { transform: 'scale(1) translateY(0)', opacity: '1' },
          '45%': { transform: 'scale(0.9) translateY(14px)', opacity: '0.9' },
          '100%': { transform: 'scale(0.3) translateY(80px)', opacity: '0' },
        },
        flyOutOfBag: {
          '0%': { transform: 'scale(0.4) translateY(30px)', opacity: '0' },
          '70%': { transform: 'scale(1.03) translateY(-3px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        bagBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.05)' },
          '75%': { transform: 'scale(0.98)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        'fly-in': 'flyIntoBag 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'fly-out': 'flyOutOfBag 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'bag-bounce': 'bagBounce 0.32s ease-out',
        'pop-in': 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
