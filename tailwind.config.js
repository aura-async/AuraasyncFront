/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../male/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../female/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#f5f5f5',
        accent: '#d4af37',
        'accent-dark': '#b38f2c',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.1' }],
        'display': ['3.5rem', { lineHeight: '1.2' }],
      },
      spacing: {
        '128': '32rem',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        marquee: 'marquee 20s linear infinite'
      }
    },
  },
  plugins: [],
} 