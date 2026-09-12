/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#962DFF',
          50: '#F8F1FF',
          100: '#F8F1FF', // Purple 100
          200: '#F0E3FF', // Purple 200
          300: '#E0C2FF', // Purple 300
          400: '#962DFF', // Purple 400
          500: '#962DFF',
          600: '#962DFF', // For existing buttons
          700: '#7A1CD6', // Darker for hover
          800: '#5F12AD',
          900: '#430982',
        },
        secondary: {
          DEFAULT: '#2D5BFF', // Using System Blue 400
          50: '#F3F6FF',
          100: '#F3F6FF',
          200: '#C6D2FD',
          300: '#93AAFD',
          400: '#2D5BFF',
          500: '#2D5BFF',
          600: '#2D5BFF',
        },
        tertiary: {
          DEFAULT: '#04CD00', // Using System Green 400
        },
        systemBlue: {
          100: '#F3F6FF',
          200: '#C6D2FD',
          300: '#93AAFD',
          400: '#2D5BFF',
        },
        systemGreen: {
          100: '#EEFEF0',
          200: '#BCEFBD',
          300: '#7FE47E',
          400: '#04CD00',
        },
        systemYellow: {
          100: '#FFFDEC',
          200: '#FFFCDD',
          300: '#FFF69D',
          400: '#FFC700',
        },
        systemRed: {
          100: '#FFF0F1',
          200: '#FBD7E0',
          300: '#FCB5C3',
          400: '#FF002F',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        brandNeutral: {
          headings: '#1A1D1E',
          text: '#8D8D99',
        }
      },
      boxShadow: {
        '01': '0 2px 4px rgba(0, 0, 0, 0.03)',
        '02': '0 4px 8px rgba(0, 0, 0, 0.04)',
        '03': '0 8px 16px rgba(0, 0, 0, 0.05)',
        '04': '0 12px 24px rgba(0, 0, 0, 0.06)',
        '05': '0 16px 32px rgba(0, 0, 0, 0.07)',
        '06': '0 24px 48px rgba(0, 0, 0, 0.08)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
    },
  },
  plugins: [],
}
