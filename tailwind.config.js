/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#111827',
        surfaceHighlight: '#1F2937',
        primary: '#0ea5e9',
        primaryHover: '#0284c7',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        textMain: '#f9fafb',
        textMuted: '#9ca3af',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
