const css = require('svgdom-css')
const chartist = require('chartist')
const fs = require('fs')

const CSSCUSTOM = `.ct-label.ct-vertical {
  font-family: Courier;
  font-weight: bold;
  font-size: 14px;
  text-anchor: end;
}
.ct-label.ct-horizontal {
  font-family: Courier;
  font-weight: bold;
  font-size: 14px;
  fill: crimson;
  text-anchor: start;
}`
const CSSPATH = require.resolve('chartist/dist/chartist.min.css')
const STYLE = CSSCUSTOM + fs.readFileSync(CSSPATH, 'utf8')
css(STYLE)

function tag(nam, cnt = '', att = {}) {
  var z = document.createElement(nam)
  for (var k in att) z.setAttribute(k, att[k])
  z.textContent = cnt
  return z
}

function title(txt, x = 0, y = 0, o = {}) {
  opt.x += x
  opt.y += y
  return tag('text', txt, o)
}

function defaults(o = {}) {
  var chart = Object.assign(
      { width: 1200, height: 600, chartPadding: { left: 20, right: 100 } },
      opt.chart
    ),
    h = Math.min(chart.width, chart.height)
  var title = Object.assign(
    {
      x: 0,
      y: 0,
      height: 0.08 * h,
      'font-size': `${0.03 * h}px`,
      'font-family': 'Verdana',
      'font-weight': 'bold',
      fill: 'crimson',
      'text-anchor': 'middle',
      role: 'caption',
    },
    opt.title
  )
  var subtitle = Object.assign(
    {
      x: 0,
      y: 0,
      height: 0.04 * h,
      'font-size': `${0.02 * h}px`,
      'font-family': 'Verdana',
      'font-weight': 'bold',
      fill: 'indianred',
      'text-anchor': 'middle',
    },
    opt.subtitle
  )
  return Object.assign({}, o, { chart, title, subtitle })
}

const opt = {
  chart: {
    width: 1200,
    height: 600,
    chartPadding: { left: 20, right: 100 },
    showArea: true,
    high: 225,
    low: 0,
    divisor: 25,
  },
  title: {
    x: 0,
    y: 0,
    height: 48,
    'font-size': '18px',
    'font-family': 'Verdana',
    'font-weight': 'bold',
    fill: 'crimson',
    'text-anchor': 'middle',
  },
  subtitle: {
    x: 0,
    y: 0,
    height: 24,
    'font-size': '12px',
    'font-family': 'Verdana',
    'font-weight': 'bold',
    fill: 'indianred',
    'text-anchor': 'middle',
  },
}

// data: {
//   title: 'title', subtitle: 'subtitle',
//   labels: ['A', 'B', 'C'], series: [
//     [1, 2, 3],
//     [4, 5, 6]
//   ]
// }

function heightProfile(data) {
  var div = document.createElement('div')
  document.querySelector('svg').appendChild(div)
  var chart = new chartist.Line(div, data, opt.chart)
  return new Promise((fres) => {
    chart.on('created', () => {
      var svg = div.querySelector('svg')
      var ttl = title(
        data.title,
        0.5 * opt.chart.width,
        0.6 * opt.title.height,
        opt.title
      )
      for (var e of div.querySelectorAll('svg > g'))
        e.setAttribute('transform', `translate(0, ${opt.title.height})`)
      for (var e of div.querySelectorAll('svg .ct-label.ct-horizontal'))
        e.setAttribute('transform', `translate(-10, 0)`)
      svg.setAttribute(
        'height',
        opt.chart.height + opt.title.height + 0.2 * opt.chart.height
      )
      svg.setAttribute('style', '')
      svg.appendChild(ttl)
      window.setComputedStyle(div)
      var txt = div.innerHTML
      div.parentNode.removeChild(div)
      fres(txt)
    })
  })
}
module.exports = heightProfile
