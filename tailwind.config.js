module.exports = {
  purge: {
    content: [
      './src/**/*.njk',
      './src/**/*.js',
      './src/**/*.svg',
      './src/**/*.md',
    ],
  },
  theme: {
    extend: {
      fontFamily: {
        inter: '"Inter", sans-serif;',
      },
      gridTemplateColumns: {
        'leg-post': 'minmax(0, 1fr) 350px',
      },
    },
  },
  future: {
    removeDeprecatedGapUtilities: true,
  },
}
