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
        // Paleta de lujo suavizada
        primary: '#121212', // Gris antracita oscuro
        secondary: '#181818', // Fondo profundo
        accent: '#FFFFFF', // Blanco puro
        bone: '#F9F9F9', // Blanco hueso para tarjetas
        cream: '#FDFCF8', // Crema suave para tarjetas
        muted: '#E8E7E1', // Gris suave para detalles
        gold: '#D4AF37', // Dorado metálico
        'gold-light': '#C5A059', // Dorado más claro
        'gold-dark': '#B8860B', // Dorado más oscuro
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.5)',
      },
    },
  },
  plugins: [],
}
