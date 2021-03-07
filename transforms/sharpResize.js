// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
const applyAsync = (acc, val) => acc.then(val)
const composeAsync = (...funcs) => (x) =>
  funcs.reduce(applyAsync, Promise.resolve(x))

const site = require('../src/globals/site.json')

// arguments: leg number
if (process.argv.length < 3) {
  console.error('Missing leg number argument')
  process.exit(1)
}

const fs = require('fs')
const sharp = require('sharp')

if (process.argv[2] === 'pan') {
  const inDir = site.imageBase + 'rawimages/pan/'
  const outDir = site.imageBase + 'images/pan/'
  const allPics = require('../src/globals/panoramas.js')
  const pics = allPics.panSrc
  let doResize
  for (p = 0; p < pics.length; p = p + 1) {
    const name = pics[p]
    console.log('Creating ' + inDir + name)
    doResize = composeAsync(
      sharp(inDir + name)
        .toFile(outDir + name)
        .catch((err) => console.log(err))
    )
  }
  doResize()
  return
}

const allPics = require('../src/globals/pics.js')
const leg = parseInt(process.argv[2], 10)
let legName
if (isNaN(leg)) {
  legName = process.argv[2]
} else {
  legName = 'leg' + leg
}

if (!allPics[legName]) {
  console.error('No pictures found for', legName)
  process.exit(1)
}
const pics = allPics[legName]

const inDir = site.imageBase + 'rawimages/' + legName + '/'
const outDir = site.imageBase + '/images/' + legName + '/'

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir)
}

// defined for landscape: adjusted to portrait later if needed
const width = [370, 600, 1200]
const height = [247, 400, 800]
let doResize

for (p = 0; p < pics.length; p = p + 1) {
  const name = pics[p].src.replace('.jpg', '')
  const portrait = pics[p].portrait ? true : false
  for (let i = 0; i < width.length; i = i + 1) {
    const w = portrait ? height[i] : width[i]
    const h = portrait ? width[i] : height[i]
    console.log(
      'Creating ' + name + '-' + w + '.jpg from ' + inDir + name + '.jpg'
    )
    doResize = composeAsync(
      sharp(inDir + name + '.jpg')
        .resize(w, h, { withoutEnlargement: true })
        .toFile(outDir + name + '-' + w + '.jpg')
        .catch((err) => console.log(err))
    )
    // don't need the 1200 webp since photoswipe only uses jpg
    if (!(w === 1200 || h === 1200)) {
      console.log(
        'Creating ' + name + '-' + w + '.webpfrom' + inDir + name + '.jpg'
      )
      doResize = composeAsync(
        sharp(inDir + name + '.jpg')
          .webp()
          .resize(w, h, { withoutEnlargement: true })
          .toFile(outDir + name + '-' + w + '.webp')
          .catch((err) => console.log(err))
      )
    }
  }
}

// copy across route profile
if (!isNaN(leg)) {
  doResize = composeAsync(
    sharp(inDir + legName + '.png')
      .toFile(outDir + legName + '.png')
      .catch((err) => console.log(err))
  )
}

const result = doResize()
