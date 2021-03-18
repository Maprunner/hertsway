import '../styles/tailwind.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import GPX from 'ol/format/GPX'
import VectorSource from 'ol/source/Vector'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { Vector as VectorLayer } from 'ol/layer'
import legsLonLat from './legsLonLat.js'
import initPhotoswipe from './photoswipe-dom.js'

// centre for overview map
const hertsLonLat = [-0.2, 51.85]

if (DEV_MODE) console.log('Dev mode is currently enabled.')

const toggleEl = document.querySelector('#color-scheme-toggle')
const DARK = 'dark'
const LIGHT = 'light'
const LOCAL_STORAGE_DARK_LIGHT = 'color-scheme'

toggleEl.addEventListener('click', () => {
  const bodyEl = document.querySelector('html')
  const isDark = bodyEl.classList.toggle('dark')
  const mode = isDark ? DARK : LIGHT
  localStorage.setItem(LOCAL_STORAGE_DARK_LIGHT, mode)

  if (isDark) {
    toggleEl.src = toggleEl.src.replace(DARK, LIGHT)
    toggleEl.alt = toggleEl.alt.replace(DARK, LIGHT)
  } else {
    toggleEl.src = toggleEl.src.replace(LIGHT, DARK)
    toggleEl.alt = toggleEl.alt.replace(LIGHT, DARK)
  }
})

const isSystemDarkMode =
  matchMedia && matchMedia('(prefers-color-scheme: dark)').matches

// start with local storage value
let mode = localStorage.getItem(LOCAL_STORAGE_DARK_LIGHT)

// if not set check preference
if (!mode) {
  if (isSystemDarkMode) {
    mode = DARK
  }
}

// default to DARK if no other setting
mode = mode || DARK

// default is DARK in <html> page.njk template so switch if needed when loading
if (mode === LIGHT) {
  document.querySelector('#color-scheme-toggle').click()
}

// toggle the menu
document.getElementById('nav-toggle').onclick = function () {
  document.getElementById('nav-content').classList.toggle('hidden')
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

var hertsStyle = {
  MultiLineString: new Style({
    stroke: new Stroke({
      color: 'rgba(121, 7, 242, 0.75)',
      width: 3,
      lineDash: [0.5, 10],
    }),
  }),
}

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

const hertsGPXLayer = new VectorLayer({
  source: new VectorSource({
    url: '../data/hertfordshire.gpx',
    format: new GPX(),
  }),
  style: function (feature) {
    return hertsStyle[feature.getGeometry().getType()]
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
  hertsGPXLayer,
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

initPhotoswipe('.gallery')
