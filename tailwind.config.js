/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        script: ['"Great Vibes"', '"Alex Brush"', 'cursive'],
      },
      colors: {
        champagne: {
          50: '#FAF7F2',
          100: '#F5EFE6',
          200: '#EBDDCB',
          300: '#DEC5AB',
          400: '#CEA685',
          500: '#BF8A60',
          600: '#AB724A',
          700: '#8E5A39',
          800: '#734830',
          900: '#5F3D2A',
        },
        rosewood: {
          50: '#FDF2F4',
          100: '#FCE7EB',
          200: '#F9D2DA',
          300: '#F4B0BE',
          400: '#ED7F98',
          500: '#E05377',
          600: '#CA345D',
          700: '#A92449',
          800: '#8D213F',
          900: '#771F39',
          950: '#430C1C',
        },
        gold: {
          400: '#E6C687',
          500: '#D4AF37',
          600: '#B89727',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
