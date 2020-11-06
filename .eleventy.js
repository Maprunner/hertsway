module.exports = (config) => {
  const siteSettings = require('./src/globals/site.json')
  const pluginRss = require('@11ty/eleventy-plugin-rss')
  const pluginSafeExternalLinks = require('eleventy-plugin-safe-external-links')

  config.addFilter('dateDisplay', require('./filters/date-display.js'))
  config.addPlugin(pluginRss)
  config.addPlugin(pluginSafeExternalLinks, {
    pattern: 'https{0,1}://', // RegExp pattern for external links
    noopener: true, // Whether to include noopener
    noreferrer: false, // Whether to include noreferrer
    files: [
      // What output file extensions to work on
      '.html',
    ],
  })
// Dirty patch so the plugin handles relatives path correctly.
// see https://github.com/chromeos/static-site-scaffold-modules/issues/24
const helpers = require('eleventy-plugin-local-respimg/lib/helpers')
helpers.generateSrcset = (sizes, src, type) => {
  return sizes
    .map((s) => `/hertsway/${src.replace(/(\.[^.]+)$/, `.${s}.${type}`)} ${s}w`)
    .join(', ')
}
// return sizes.map(s => `${replaceExt(src, `.${s}.${type}`)} ${s}w`).join(', ');

const pluginLocalRespimg = require('eleventy-plugin-local-respimg')
  config.addPlugin(pluginLocalRespimg, {
    folders: {
      source: 'src', // Folder images are stored in
      output: 'dist', // Folder images should be output to
    },
    images: {
      resize: {
        min: 250, // Minimum width to resize an image to
        max: 1500, // Maximum width to resize an image to
        step: 350, // Width difference between each resized image
      },
      gifToVideo: false, // Convert GIFs to MP4 videos
      sizes: '100vw', // Default image `sizes` attribute
      lazy: true, // Include `loading="lazy"` attribute for images
      additional: [
        // Globs of additional images to optimize (won't be resized)
      ],
      watch: {
        src: 'images/**/*', // Glob of images that Eleventy should watch for changes to
      },
      pngquant: {
        /* ... */
      }, // imagemin-pngquant options
      mozjpeg: {
        /* ... */
      }, // imagemin-mozjpeg options
      svgo: {
        /* ... */
      }, // imagemin-svgo options
      gifresize: {
        /* ... */
      }, // @gumlet/gif-resize options
      webp: {
        /* ... */
      }, // imagemin-webp options
      gifwebp: {
        /* ... */
      }, // imagemin-gif2webp options
    },
  })

  config.addPassthroughCopy({ public: './' })
  config.addPassthroughCopy('src/images')
  config.addPassthroughCopy('src/data')

  config.setBrowserSyncConfig({
    files: ['dist/**/*'],
    open: true,
  })

  config.setDataDeepMerge(true)

  config.addFilter('formatMins', function (mins) {
    const minutes = mins % 60
    return (
      Math.floor(mins / 60) +
      ' hours ' +
      minutes.toString().padStart(2, '0') +
      ' minutes'
    )
  })

  config.addCollection('frontposts', function (collectionApi) {
    // get posts to show on front page
    return collectionApi
      .getFilteredByTag('post')
      .sort(function (a, b) {
        return b.date - a.date
      })
      .slice(0, 6)
  })

  config.addShortcode('LegMap', function (name) {
    return `<div id="${name}" class="legMap"></div>`
  })

  return {
    pathPrefix: siteSettings.baseUrl,
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'includes',
      layouts: 'includes/layouts',
      data: 'globals',
    },
    passthroughFileCopy: true,
  }
}
