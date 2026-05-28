/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css,scss}",
  ],
  // Prefixar con 'tw-' para evitar conflictos con PrimeNG
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        // Paleta hospitalaria Galenos Pro
        'hospital-blue': {
          50:  '#e8f0fe',
          100: '#c5d8fc',
          200: '#9dbef9',
          300: '#72a3f6',
          400: '#4f8df4',
          500: '#2378f0',  // Azul hospitalario base
          600: '#1a5ecb',
          700: '#1448a8',
          800: '#0d3486',
          900: '#082063',
        },
        'hospital-cyan': {
          50:  '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#00bcd4',  // Cian base
          600: '#00acc1',
          700: '#0097a7',
          800: '#00838f',
          900: '#006064',
        },
        'health-white': '#f8fafc',
        'health-gray': {
          50:  '#f8fafc',
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
        'alert-danger':  '#ef4444',
        'alert-warning': '#f59e0b',
        'alert-success': '#10b981',
        'alert-info':    '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,.07), 0 1px 2px -1px rgba(0,0,0,.07)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,.10), 0 2px 4px -2px rgba(0,0,0,.10)',
        'navbar': '0 2px 8px rgba(23,78,240,.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
  // Desactivar preflight para no pisar los estilos base de PrimeNG
  corePlugins: {
    preflight: false,
  },
};
