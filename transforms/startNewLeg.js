// reads in a raw GPX file
// calculates min and max values needed to create map
// filters it down to a point every minDist metres to save a lot of space
const minDist = 10
const fs = require('fs')
let legs = require('../src/globals/legs.js')
let legsLonLat = require('../src/scripts/legsLonLat.js')
const svg2img = require('node-svg2img')
const heightProfile = require('./heightProfile')

const emptyLegData = {
  distance: 0,
  snack: 'Mince pies',
  climb: 0,
  high: 0,
  low: 0,
  from: '',
  to: '',
  time: 0,
  name: '',
  title: '',
  omaps: 'None',
}

// arguments: leg number, from, to
if (process.argv.length < 3) {
  console.error('Missing leg number argument')
  process.exit(1)
}
if (process.argv.length < 4) {
  console.error('Missing "From" argument')
  process.exit(1)
}
if (process.argv.length < 5) {
  console.error('Missing "To" argument')
  process.exit(1)
}

const leg = parseInt(process.argv[2], 10)
const from = process.argv[3]
const to = process.argv[4]
const legName = 'leg' + leg

const gpxFile = './src/data/' + legName + '.gpx'
const pngFile = './src/images/' + legName + '/' + legName + '.png'
const legsFile = './src/globals/legs.js'
const lonLatFile = './src/scripts/legsLonLat.js'
const imageDir = './src/images/' + legName

// avoid recreating an existing leg
if (fs.existsSync(imageDir)) {
  console.error('Leg already started')
  process.exit(1)
}

try {
  // create image directory
  fs.mkdirSync(imageDir)

  // read original GPX file
  const olddata = fs.readFileSync(gpxFile, 'utf8')

  // filter it down and extract stats
  const { newfile, height, distance, lon, lat } = processFile(olddata)

  // save filtered version of file
  fs.writeFileSync(gpxFile, newfile)

  // extract profile data
  const { series, maxHeight, minHeight } = filterHeight(height, distance)
  const data = {
    title: 'Leg ' + leg + ' profile',
    series: [series],
  }

  // create profile png
  heightProfile(data).then((svg) => {
    svg2img(svg, function (error, buffer) {
      if (error) {
        console.log(error)
      } else {
        fs.writeFileSync(pngFile, buffer)
      }
    })
  })

  // create new leg array if needed
  if (!(legName in legs)) {
    legs[legName] = emptyLegData
  }
  // update leg details
  legs[legName].name = legName
  legs[legName].title = from + ' to ' + to
  legs[legName].high = parseInt(maxHeight + 0.5, 10)
  legs[legName].low = parseInt(minHeight + 0.5, 10)
  if (leg > 1) {
    legs[legName].from = legs['leg' + (leg - 1)].to
  }

  // save updated legs.js
  fs.writeFileSync(legsFile, 'module.exports = ' + JSON.stringify(legs))

  // save updated legsLonLat.js
  const lonLat = []
  lonLat.push(parseFloat(lon.toFixed(2)))
  lonLat.push(parseFloat(lat.toFixed(2)))
  legsLonLat[leg - 1] = lonLat
  fs.writeFileSync(lonLatFile, 'module.exports = ' + JSON.stringify(legsLonLat))

  // create new post if needed
  const postFile =
    './src/posts/leg-' +
    leg +
    '-' +
    from.toLowerCase() +
    '-' +
    to.toLowerCase() +
    '.md'
  if (!fs.existsSync(postFile)) {
    let newPost = fs.readFileSync('./src/globals/leg-empty.md', 'utf8')
    const now = new Date(Date.now())

    newPost = newPost
      .replace('<title>', 'Leg ' + leg + ' ' + from + ' to ' + to)
      .replace('<name>', legName)
      .replace('<image>', legName + '.png')
      .replace(
        '<date>',
        now.getFullYear() +
          '-' +
          pad(now.getMonth() + 1) +
          '-' +
          pad(now.getDate())
      )
    fs.writeFileSync(postFile, newPost)
  }
} catch (err) {
  console.error(err)
}

function pad(value) {
  if (value < 10) {
    return '0' + value
  }
  return value
}
function toRad(degrees) {
  return (degrees * Math.PI) / 180
}

function getLatLonDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula (http://www.codecodex.com/wiki/Calculate_distance_between_two_points_on_a_globe)
  var dLat, dLon, a
  dLat = toRad(lat2 - lat1)
  dLon = toRad(lon2 - lon1)
  a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  // multiply by IUUG earth mean radius (http://en.wikipedia.org/wiki/Earth_radius) in metres
  return 6371009 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function filterHeight(height, distance) {
  let series = []
  const delta = 0.24

  let maxHeight = 0
  let minHeight = 1000
  let currentHeight = height[0]
  series[0] = { x: 0, y: height[0] }

  // smooth heights to changes of greater than delta metres
  for (let i = 1; i < height.length; i = i + 1) {
    maxHeight = Math.max(maxHeight, height[i])
    minHeight = Math.min(minHeight, height[i])
    if (Math.abs(parseFloat(height[i]) - parseFloat(currentHeight)) > delta) {
      series.push({ x: distance[i] / 1000, y: height[i] })
      currentHeight = parseFloat(height[i])
    } else {
      // make sure we use the last point
      if (i === height.length) {
        series.push({ x: distance[i] / 1000, y: height[i] })
      }
    }
  }
  console.log('Max height: ', maxHeight)
  console.log('Min height: ', minHeight)

  return { series: series, maxHeight: maxHeight, minHeight: minHeight }
}

function processFile(data) {
  // could have parsed the XML but didn't..
  const lines = data.split(/[\r\n]+/g)
  let maxLat = -180
  let minLat = 180
  let maxLon = -180
  let minLon = 180
  let newlines = []
  let useLines = []
  let height = []
  let distance = []
  let keep = true
  //  <trkpt lat="52.0467280" lon="-0.0301510">
  // first pass through deletes extension details
  for (let i = 0; i < lines.length; i = i + 1) {
    if (keep) {
      if (lines[i].indexOf('<extensions>') > -1) {
        keep = false
      } else {
        newlines.push(lines[i])
        useLines.push(true)
      }
    } else {
      if (lines[i].indexOf('</extensions>') > -1) {
        keep = true
      }
    }
  }
  let startTrk = 0
  let inTrk = false
  let currentLat = 0
  let currentLon = 0
  let lat = 0
  let lon = 0
  let savedHeight = 0
  let savedDistance = 0
  // second pass through gets limits of track and deletes trkpoints where we haven't moved much
  for (let i = 0; i < newlines.length; i = i + 1) {
    // if we are processing a trkpt
    if (inTrk) {
      if (newlines[i].indexOf('<ele>') > -1) {
        savedHeight = newlines[i]
          .replace('<ele>', '')
          .replace('</ele>', '')
          .trim()
      }
      if (newlines[i].indexOf('</trkpt') > -1) {
        // found the end so decide if we need to keep it
        inTrk = false
        const dist = getLatLonDistance(currentLat, currentLon, lat, lon)
        if (dist > minDist) {
          currentLat = lat
          currentLon = lon
          // don't add first distance since it is from (0, 0) to the start point
          if (distance.length > 0) {
            savedDistance = savedDistance + dist
          }
          distance.push(savedDistance)
          height.push(savedHeight)
        } else {
          for (let j = startTrk; j <= i; j = j + 1) {
            useLines[j] = false
          }
        }
      }
    } else {
      // check for start of new trkpt
      if (newlines[i].indexOf('<trkpt') > -1) {
        inTrk = true
        startTrk = i
        const bits = newlines[i].split('"')
        lat = parseFloat(bits[1])
        lon = parseFloat(bits[3])
        if (isNaN(lat) || isNaN(lon)) {
          console.log('Lat/Lon error: ', newlines[i])
        }
        maxLat = Math.max(maxLat, lat)
        minLat = Math.min(minLat, lat)
        maxLon = Math.max(maxLon, lon)
        minLon = Math.min(minLon, lon)
      } else {
        useLines[i] = true
      }
    }
  }

  console.log(
    'Lat:  ' +
      maxLat +
      ', ' +
      minLat +
      ', ' +
      ((minLat + maxLat) / 2).toFixed(2)
  )
  console.log(
    'Lon:  ' +
      maxLon +
      ', ' +
      minLon +
      ', ' +
      ((minLon + maxLon) / 2).toFixed(2)
  )
  let newfile = ''
  for (let i = 0; i < newlines.length; i = i + 1) {
    if (useLines[i]) {
      newfile = newfile + newlines[i] + '\r\n'
    }
  }

  return {
    newfile: newfile,
    height: height,
    distance: distance,
    lon: (minLon + maxLon) / 2,
    lat: (minLat + maxLat) / 2,
  }
}
