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
          50: '#f2f8ff',
          100: '#e6f0ff',
          200: '#c3d9ff',
          300: '#93bcff',
          400: '#5f96ff',
          500: '#3d76f5',
          600: '#2d5de9',
          700: '#264acb',
          800: '#253f9f',
          900: '#233981',
        },
        slate: {
          25: '#f9fbff',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.1rem',
        '3xl': '1.4rem',
      },
      boxShadow: {
        soft: '0 16px 40px -28px rgba(15, 23, 42, 0.45)',
        card: '0 20px 50px -32px rgba(15, 23, 42, 0.35)',
        crisp: '0 8px 22px -14px rgba(15, 23, 42, 0.3)',
      },
      backgroundImage: {
        'hero-mesh': 'radial-gradient(circle at 10% 10%, rgba(93, 137, 255, 0.15), transparent 44%), radial-gradient(circle at 90% 12%, rgba(56, 189, 248, 0.12), transparent 42%), linear-gradient(180deg, #f9fbff 0%, #f4f7fb 45%, #edf2fa 100%)',
      },
      animation: {
        fadeIn: 'fadeIn 360ms ease-out',
        slideUp: 'slideUp 320ms ease-out',
        pulseSoft: 'pulseSoft 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}