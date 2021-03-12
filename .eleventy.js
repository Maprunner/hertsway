module.exports = (config) => {
  const siteSettings = require('./src/globals/site.json')
  const panoramas = require('./src/globals/panoramas.js')
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

  config.addPassthroughCopy({ public: './' })
  config.addPassthroughCopy({
    '../../../Users/simon/OneDrive/Pictures/Pictures/hertsway/images/':
      'images',
  })
  config.addPassthroughCopy('src/data')
  config.addPassthroughCopy({ 'src/styles/default-skin.*': 'assets' })

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

  config.addShortcode('Banner', function (url) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
    // min = 0 max = panCount  The maximum is exclusive and the minimum is inclusive
    // Math.floor(Math.random() * (max - min) + min)
    let rand
    if (url === '/') {
      rand = 0
    } else {
      if (url === '/churches/') {
        rand = 26
      } else {
        // url looks like /post/leg-1-royston-to-sandon/
        const idx = url.indexOf('/post/leg-')
        if (idx > -1) {
          const bits = (rand = url.replace('/post/leg-', '').split('-'))
          rand = parseInt(bits[0], 10)
        } else {
          rand = Math.floor(Math.random() * panoramas.panCount)
        }
      }
    }
    const jpg = panoramas.panSrc[rand]
    const webp = jpg.replace('.jpg', '.webp')
    const caption = panoramas.panCaption[rand]
    return `
    <picture>
      <source srcset="${siteSettings.baseUrl}images/pan/${webp}" type="image/webp">
      <source srcset="${siteSettings.baseUrl}images/pan/${jpg}" type="image/jpeg">
      <img src="${siteSettings.baseUrl}images/pan/${jpg}" alt="${caption}" title="${caption}"/>
    </picture>
    <div class="banner-overlay hidden sm:block">
      <div class="text-sm text-white p-1 italic">
        ${caption}
      </div>
    </div>`
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
