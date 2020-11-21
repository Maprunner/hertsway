const css = require('svgdom-css')
const chartist = require('chartist')
const fs = require('fs')

const cssPath = require.resolve('chartist/dist/chartist.min.css')
const styles = fs.readFileSync(cssPath, 'utf8')
css(styles)

const opt = {
  width: '1000px',
  height: '300px',
  chartPadding: { left: 20, right: 100 },
  showArea: true,
  showPoint: false,
  high: 225,
  low: 0,
  axisY: {
    scaleMinSpace: 25,
  },
  axisX: {
    type: chartist.AutoScaleAxis,
    onlyInteger: true,
    scaleMinSpace: 5,
  },
}

function heightProfile(data) {
  var div = document.createElement('div')
  document.querySelector('svg').appendChild(div)
  var chart = new chartist.Line(div, data, opt)
  return new Promise((fres) => {
    chart.on('created', () => {
      var svg = div.querySelector('svg')
      svg.setAttribute('height', 1.2 * opt.height)
      svg.setAttribute('style', '')
      window.setComputedStyle(div)
      var txt = div.innerHTML
      div.parentNode.removeChild(div)
      fres(txt)
    })
  })
}
module.exports = heightProfile
