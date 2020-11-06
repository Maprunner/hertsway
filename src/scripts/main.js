import '../styles/tailwind.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import GPX from 'ol/format/GPX'
import VectorSource from 'ol/source/Vector'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { Vector as VectorLayer } from 'ol/layer'

if (DEV_MODE) console.log('Dev mode is currently enabled.')

//Javascript to toggle the menu
document.getElementById('nav-toggle').onclick = function () {
  document.getElementById('nav-content').classList.toggle('hidden')
}

Number.prototype.toRad = function () {
  return (this * Math.PI) / 180
}

//Javascript to process GPX files: only available in development
// removes extras and limits to one point every 10 metres so file size is hugely reduced
// also determines limits of track to allow centering of map
// messy but it gets things done for now
if (DEV_MODE && document.getElementById('devGPX')) {
  document.getElementById('devGPX').style.display = 'block'

  document.getElementById('loadGPX').onchange = function (evt) {
    var reader, self
    reader = new FileReader()
    self = this
    try {
      reader.readAsText(evt.target.files[0])
    } catch (err) {
      console.log('File read error', 'Failed to open selected file.')
      return
    }
    reader.onerror = function () {
      console.log('File error', 'The selected file could not be read.')
    }
    reader.onload = function (evt) {
      const lines = evt.target.result.split(/[\r\n]+/g)
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
      const minDist = 10

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

      console.log(
        'Lat:  ' + maxLat + ', ' + minLat + ', ' + (minLat + maxLat) / 2
      )
      console.log(
        'Lon:  ' + maxLon + ', ' + minLon + ', ' + (minLon + maxLon) / 2
      )
      let newfile = ''
      for (let i = 0; i < newlines.length; i = i + 1) {
        if (useLines[i]) {
          newfile = newfile + newlines[i] + '\r\n'
        }
      }
      // copy console output and paste into new GPX file
      console.log(newfile)
    }
  }
}

var style = {
  Point: new Style({
    image: new CircleStyle({
      fill: new Fill({
        color: 'rgba(85,0,128,0.4)',
      }),
      radius: 10,
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  }),
  MultiLineString: new Style({
    stroke: new Stroke({
      color: '#f00',
      width: 3,
    }),
  }),
}

var backStyle = {
  MultiLineString: new Style({
    stroke: new Stroke({
      color: '#00f',
      width: 3,
    }),
  }),
}

const getLatLonDistance = (lat1, lon1, lat2, lon2) => {
  // Haversine formula (http://www.codecodex.com/wiki/Calculate_distance_between_two_points_on_a_globe)
  var dLat, dLon, a
  dLat = (lat2 - lat1).toRad()
  dLon = (lon2 - lon1).toRad()
  a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1.toRad()) *
      Math.cos(lat2.toRad()) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  // multiply by IUUG earth mean radius (http://en.wikipedia.org/wiki/Earth_radius) in metres
  return 6371009 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// centre for overview map
const hertsLonLat = [-0.2, 51.85]

// centres for leg maps
// add new entry for each new leg GPX file
const legsLonLat = [
  [-0.05, 52.02],
  [-0.12, 51.97],
  [-0.2, 51.94],
  [-0.26, 51.9],
  [-0.27, 51.85],
  [-0.29, 51.81],
  [-0.32, 51.76],
]

// overview map
const thereGPXLayer = new VectorLayer({
  source: new VectorSource({
    url: '../data/hertsway.gpx',
    format: new GPX(),
  }),
  style: function (feature) {
    return style[feature.getGeometry().getType()]
  },
})

const backGPXLayer = new VectorLayer({
  source: new VectorSource({
    url: '../data/hertsway-back.gpx',
    format: new GPX(),
  }),
  style: function (feature) {
    return backStyle[feature.getGeometry().getType()]
  },
})

let ovLayers = [
  new TileLayer({
    source: new XYZ({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    }),
  }),
  backGPXLayer,
  thereGPXLayer,
]

// individual leg maps
for (let i = 0; i < legsLonLat.length; i = i + 1) {
  const gpxLayer = new VectorLayer({
    source: new VectorSource({
      url: '../../data/leg' + (i + 1) + '.gpx',
      format: new GPX(),
    }),
    style: function (feature) {
      return style[feature.getGeometry().getType()]
    },
  })

  new Map({
    target: 'leg' + (i + 1),
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        }),
      }),
      gpxLayer,
    ],
    view: new View({
      center: fromLonLat(legsLonLat[i]),
      zoom: 11,
    }),
  })
}

// overview map
new Map({
  target: 'map',
  layers: ovLayers,
  view: new View({
    center: fromLonLat(hertsLonLat),
    zoom: 10,
  }),
})
