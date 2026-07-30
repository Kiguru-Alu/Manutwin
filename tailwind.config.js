/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-cream': '#F9F6F0',
        'charcoal': '#121212',
        'industrial-orange': '#FF5722',
        'border-soft': '#E5E0D8',
      },
      fontSize: {
        'xxs': '0.65rem',
      },
    },
  },
  plugins: [],
}
