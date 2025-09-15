/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro basado en clases
  theme: {
    extend: {
      colors: {
        // Paleta de colores corporativa de PiezasYA
        racing: {
          50: '#fffbf0',
          100: '#fff4cc',
          200: '#ffe799',
          300: '#ffda66',
          400: '#ffcd33',
          500: '#FFC300', // Amarillo Racing principal
          600: '#e6af00',
          700: '#cc9b00',
          800: '#b38700',
          900: '#997300',
        },
        carbon: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#333333', // Gris Carbón principal
        },
        onix: {
          50: '#f2f2f2',
          100: '#e6e6e6',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#000000', // Negro Onix principal
        },
        alert: {
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f98080',
          500: '#f05252',
          600: '#E63946', // Rojo Alerta principal
          700: '#c81e1e',
          800: '#9b1c1a',
          900: '#771d1d',
        },
        snow: {
          50: '#ffffff',
          100: '#ffffff',
          200: '#ffffff',
          300: '#ffffff',
          400: '#ffffff',
          500: '#FFFFFF', // Blanco Nieve principal
          600: '#f5f5f5',
          700: '#e5e5e5',
          800: '#d4d4d4',
          900: '#a3a3a3',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
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
        }
      },
      backgroundColor: {
        'dark': '#1a1a1a',
        'dark-secondary': '#2d2d2d',
        'dark-tertiary': '#404040',
      },
      textColor: {
        'dark': '#ffffff',
        'dark-secondary': '#e5e5e5',
        'dark-muted': '#a3a3a3',
      },
      borderColor: {
        'dark': '#404040',
        'dark-secondary': '#525252',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 