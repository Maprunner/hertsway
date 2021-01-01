module.exports = (config) => {
  const siteSettings = require('./src/globals/site.json')
  const pluginRss = require('@11ty/eleventy-plugin-rss')
  const pluginSafeExternalLinks = require('eleventy-plugin-safe-external-links')

  config.addFilter('dateDisplay', require('./filters/date-display.js'))
  config.addFilter('slugifyTag', require('./filters/slugify-tag.js'))
  config.addFilter('prettifyMinutes', require('./filters/prettify-minutes.js'))
  config.addFilter(
    'prettifyAbbrevMinutes',
    require('./filters/prettify-abbrev-minutes.js')
  )

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
      .map(
        (s) => `\\hertsway\\${src.replace(/(\.[^.]+)$/, `.${s}.${type}`)} ${s}w`
      )
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
        // assuming photos are 600x400
        min: 370, // Minimum width to resize an image to
        max: 600, // Maximum width to resize an image to
        step: 230, // Width difference between each resized image
      },
      sizes: '(min-width: 1024px) 370px, 100vw', // Default image `sizes` attribute
      lazy: true, // Include `loading="lazy"` attribute for images
      additional: [
        // Globs of additional images to optimize (won't be resized)
      ],
      watch: {
        src: 'images/**/*', // Glob of images that Eleventy should watch for changes to
      },
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

  // convert "legx" to "Leg X"
  config.addFilter('formatLegX', function (legx) {
    return 'Leg ' + legx.slice(3)
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

  config.addCollection('tags', function (collectionApi) {
    let tagsCollection = new Map()
    let max = 0

    collectionApi.getAll().forEach(function (item) {
      if ('tags' in item.data) {
        for (const tag of item.data.tags) {
          if (tag !== 'post') {
            let number = (tagsCollection.get(tag) || 0) + 1
            max = Math.max(max, number)
            tagsCollection.set(tag, number)
          }
        }
      }
    })

    const minLog = Math.log(1)
    const maxLog = Math.log(max)

    const tags = []
    tagsCollection.forEach((number, tag) => {
      let factor = (Math.log(number) - minLog) / (maxLog - minLog)
      let newTag = {
        tag: tag,
        number: number,
        factor: factor,
        step: Math.ceil(factor * 4) + 1,
      }

      tags.push(newTag)
    })

    tags.sort((a, b) => {
      return a.tag.localeCompare(b.tag, 'en', { ignorePunctuation: true })
    })

    return tags
  })

  config.addShortcode('FixedDP', function (value, dp) {
    return value.toFixed(dp)
  })

  config.addShortcode('LegMap', function (name) {
    return `<div id="${name}" class="legMap"></div>`
  })

  config.addShortcode('LegLink', function (leg, title) {
    const url =
      process.env.NODE_ENV === 'production'
        ? siteSettings.url
        : siteSettings.devUrl
    return (
      url +
      siteSettings.baseUrl +
      'post/' +
      leg.replace('leg', 'leg-') +
      '-' +
      title.toLowerCase().replace(/ /g, '-') +
      '/'
    )
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
