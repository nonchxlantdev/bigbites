export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bite: {
          red: '#ef1c25',
          dark: '#141414',
          soft: '#fff2f2'
        }
      },
      boxShadow: {
        bite: '0 18px 40px rgba(20, 20, 20, 0.10)'
      }
    }
  },
  plugins: []
};
