module.exports = {
  content: [
    './frontend/views/**/*.html',
    './frontend/public/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5EFE7',
        'brand-green': '#1F4E34',
        'brand-green-dark': '#173E2A',
        'accent-orange': '#E67A2B',
        charcoal: '#1A1A1A',
        muted: '#6B6B6B',
        brown: {
          50: '#fdf6f3',
          100: '#f7e5dc',
          200: '#e9c8ba',
          300: '#d6a48b',
          400: '#c78968',
          500: '#b6734f',
          600: '#995c3c',
          700: '#7c4930',
          800: '#5f3523',
          900: '#432317'
        }
      },
      boxShadow: {
        'card': '0 6px 18px rgba(31,78,52,0.08)',
        'cta': '0 8px 24px rgba(31,78,52,0.12)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem'
      }
    }
  },
  plugins: []
}
