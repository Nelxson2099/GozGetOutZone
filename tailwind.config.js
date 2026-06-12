/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        // Brand palette — Equilibrium
        night:     { DEFAULT: '#0A0B0F', 50: '#13141A', 100: '#0E0F14', 200: '#0A0B0F' },
        surface:   { DEFAULT: '#12141C', light: '#1A1D29', card: '#161924' },
        border:    { DEFAULT: '#1E2235', light: '#252A40' },
        // Zone accent colors
        comfort:   { DEFAULT: '#6366F1', glow: 'rgba(99,102,241,0.3)' },   // Indigo
        fear:      { DEFAULT: '#EF4444', glow: 'rgba(239,68,68,0.3)' },     // Red
        learning:  { DEFAULT: '#F59E0B', glow: 'rgba(245,158,11,0.3)' },   // Amber
        growth:    { DEFAULT: '#10B981', glow: 'rgba(16,185,129,0.3)' },    // Emerald
        // Text
        text:      { primary: '#F1F3F9', secondary: '#8892A4', muted: '#4A5166' },
      },
      backgroundImage: {
        'glow-comfort':  'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'glow-fear':     'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, transparent 70%)',
        'glow-learning': 'radial-gradient(ellipse at center, rgba(245,158,11,0.15) 0%, transparent 70%)',
        'glow-growth':   'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)',
        'grid-pattern':  'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'slide-up':     'slideUp 0.4s cubic-bezier(0.19,1,0.22,1)',
        'fade-in':      'fadeIn 0.3s ease-in-out',
        'spin-slow':    'spin 8s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      boxShadow: {
        'comfort':  '0 0 30px rgba(99,102,241,0.3)',
        'fear':     '0 0 30px rgba(239,68,68,0.3)',
        'learning': '0 0 30px rgba(245,158,11,0.3)',
        'growth':   '0 0 30px rgba(16,185,129,0.3)',
        'glass':    '0 8px 32px rgba(0,0,0,0.4)',
        'card':     '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
