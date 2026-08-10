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
          50:  '#f0edff',
          100: '#e0dbff',
          200: '#c2b8ff',
          300: '#a394ff',
          400: '#8470ff',
          500: '#6c52ff',
          600: '#5538e0',
          700: '#4028b8',
          800: '#2c1b8f',
          900: '#1a1060',
          950: '#0d0830',
        },
        surface: {
          50:  '#f5f5ff',
          100: '#eeeeff',
          200: '#d4d4f0',
          300: '#a8a8c8',
          400: '#7070a0',
          500: '#404068',
          600: '#282850',
          700: '#181838',
          800: '#101028',
          900: '#0a0a1a',
          950: '#05050f',
        },
        accent: {
          cyan:   '#22d3ee',
          violet: '#a78bfa',
          green:  '#4ade80',
          amber:  '#fbbf24',
          red:    '#f87171',
        }
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(108,82,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(108,82,255,0.06) 1px, transparent 1px)",
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(108,82,255,0.3), transparent)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'brand-gradient': 'linear-gradient(135deg, #6c52ff 0%, #a78bfa 100%)',
        'scan-gradient': 'linear-gradient(135deg, #22d3ee 0%, #6c52ff 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-slow':    'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':         'float 6s ease-in-out infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
        'slide-up':      'slideUp 0.5s ease-out',
        'fade-in':       'fadeIn 0.4s ease-out',
        'border-spin':   'borderSpin 4s linear infinite',
        'shimmer':       'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 20px rgba(108,82,255,0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(108,82,255,0.5)' },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        borderSpin: {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'brand':  '0 0 30px rgba(108,82,255,0.25)',
        'brand-lg': '0 0 60px rgba(108,82,255,0.35)',
        'card':   '0 4px 24px rgba(0,0,0,0.4)',
        'inner-brand': 'inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.3)',
        'glow-violet': '0 0 20px rgba(167,139,250,0.3)',
        'glow-green': '0 0 20px rgba(74,222,128,0.3)',
      }
    },
  },
  plugins: [],
}
