// reads in a raw GPX file
// calculates min and max values needed to create map
// filters it down to a point every minDist metres to save a lot of space
const minDist = 10

const fs = require('fs')

// argument expected to be the raw "leg11.gpx" already in src/data directory
if (process.argv.length < 3) {
  console.error('Missing file name argument')
  process.exit(1)
}

const file = './src/data/' + process.argv[2]

try {
  const data = fs.readFileSync(file, 'utf8')
  const newfile = processFile(data)
  fs.writeFileSync(file, newfile)
} catch (err) {
  console.error(err)
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

function processFile(data) {
  const lines = data.split(/[\r\n]+/g)
  let maxLat = -180
  let minLat = 180
  let maxLon = -180
  let minLon = 180
  let newlines = []
  let useLines = []
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

  // second pass through gets limits of track and deletes trkpoints where we haven't moved much
  for (let i = 0; i < newlines.length; i = i + 1) {
    // if we are processing a trkpt
    if (inTrk) {
      if (newlines[i].indexOf('</trkpt') > -1) {
        // found the end so decide if we need to keep it
        inTrk = false
        const dist = getLatLonDistance(currentLat, currentLon, lat, lon)
        if (dist > minDist) {
          if (dist > 20) {
            console.log(dist)
          }
          currentLat = lat
          currentLon = lon
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

  console.log('Lat:  ' + maxLat + ', ' + minLat + ', ' + (minLat + maxLat) / 2)
  console.log('Lon:  ' + maxLon + ', ' + minLon + ', ' + (minLon + maxLon) / 2)
  let newfile = ''
  for (let i = 0; i < newlines.length; i = i + 1) {
    if (useLines[i]) {
      newfile = newfile + newlines[i] + '\r\n'
    }
  }

  return newfile
}
