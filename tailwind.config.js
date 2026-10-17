/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lol: {
          gold: '#C89B3C',
          'gold-light': '#F0E6D3',
          'gold-dark': '#785A28',
          bg: '#0A0E17',
          'bg-2': '#111827',
          'bg-3': '#1a2236',
          'bg-card': '#0D1117',
          blue: '#0BC4E3',
          'blue-dark': '#0A3B4C',
          red: '#E84057',
          'red-dark': '#4C0A14',
          green: '#00B074',
          purple: '#9B69C2',
          parchment: '#C8AA6E',
          border: '#2A3A5C',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C89B3C 0%, #F0E6D3 50%, #C89B3C 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0D1117 0%, #0A0E17 100%)',
        'blue-glow': 'radial-gradient(ellipse at center, rgba(11,196,227,0.15) 0%, transparent 70%)',
        'red-glow': 'radial-gradient(ellipse at center, rgba(232,64,87,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        gold: '0 0 20px rgba(200,155,60,0.4)',
        'gold-sm': '0 0 8px rgba(200,155,60,0.3)',
        blue: '0 0 20px rgba(11,196,227,0.4)',
        red: '0 0 20px rgba(232,64,87,0.4)',
        inner: 'inset 0 1px 0 rgba(200,155,60,0.2)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(200,155,60,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(200,155,60,0.7)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
