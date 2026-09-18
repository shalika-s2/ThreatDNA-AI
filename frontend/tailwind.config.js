/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#000000',
        secondary: '#080808',
        card: '#0c0c0c',
        cardHover: '#141414',
        border: '#332000',
        borderLight: '#553500',
        terminalAmber: {
          DEFAULT: '#FF9900',
          hover: '#FFAC33',
          bright: '#FFB800',
          dark: '#995C00',
          dim: '#332000',
          glow: 'rgba(255, 153, 0, 0.25)',
        },
        stockGreen: {
          DEFAULT: '#00E676',
          bright: '#00FF88',
          dark: '#008744',
          glow: 'rgba(0, 230, 118, 0.25)',
        },
        stockRed: {
          DEFAULT: '#FF5252',
          bright: '#FF1744',
          dark: '#B71C1C',
          glow: 'rgba(255, 82, 82, 0.25)',
        },
        cyberRed: {
          DEFAULT: '#FF5252',
          dark: '#B71C1C',
          glow: 'rgba(255, 82, 82, 0.25)',
        },
        cyberGreen: {
          DEFAULT: '#00E676',
          dark: '#008744',
          glow: 'rgba(0, 230, 118, 0.25)',
        },
        cyberAmber: {
          DEFAULT: '#FF9900',
          dark: '#995C00',
          glow: 'rgba(255, 153, 0, 0.25)',
        },
        cyberCyan: {
          DEFAULT: '#00E5FF',
          dark: '#00838F',
          glow: 'rgba(0, 229, 255, 0.25)',
        },
        textPrimary: '#FFFFFF',
        textSecondary: '#D4D4D8',
        textMuted: '#8A8A8E',
        textAmber: '#FF9900',
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'Consolas', '"Fira Code"', 'monospace'],
        mono: ['"JetBrains Mono"', 'Consolas', '"Fira Code"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        terminalAmber: '0 0 12px rgba(255, 153, 0, 0.35)',
        terminalGreen: '0 0 12px rgba(0, 230, 118, 0.35)',
        terminalRed: '0 0 12px rgba(255, 82, 82, 0.35)',
        cyberRed: '0 0 12px rgba(255, 82, 82, 0.35)',
        cyberGreen: '0 0 12px rgba(0, 230, 118, 0.35)',
        cyberCyan: '0 0 12px rgba(0, 229, 255, 0.35)',
        cardGlow: '0 0 0 1px #332000, 0 4px 20px rgba(0, 0, 0, 0.9)',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
