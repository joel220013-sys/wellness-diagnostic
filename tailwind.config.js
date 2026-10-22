/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          50: '#F0F9F5',
          100: '#DDF1E7',
          200: '#BCE2D0',
          300: '#8DCAB1',
          400: '#53AC8D',
          500: '#08784E', // Brand botanical green
          600: '#066542',
          700: '#065939', // Darker botanical
          800: '#09432D',
          900: '#0D2319', // Dark green-black text
          950: '#05140E',
        },
        peach: {
          50: '#FFF7F2',
          100: '#FDEEE4',
          200: '#FBDCCB',
          300: '#F6B58D', // Brand warm peach
          400: '#F18C52',
          500: '#E86E2A',
          600: '#C95318',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FFFDF9',
          200: '#FFF9F2', // Brand ivory background
          300: '#F9F1E6',
          400: '#F0E5D5',
          500: '#E2D3BE',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(13, 35, 25, 0.05)',
        'soft': '0 4px 20px -2px rgba(8, 120, 78, 0.07)',
        'soft-lg': '0 10px 30px -4px rgba(8, 120, 78, 0.1)',
        'soft-card': '0 2px 14px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
