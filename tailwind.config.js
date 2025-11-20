module.exports = {
  content: [
    './views/**/*.html',
    './public/**/*.js',
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
