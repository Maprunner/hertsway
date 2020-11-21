// generates a height profile SVG

const css = require('svgdom-css')
const chartist = require('chartist')
const fs = require('fs')

const customCSS = `.ct-area {
  fill: rgb(214, 158, 46);
  fill-opacity: .8;
}
.ct-label {
  font-family: Verdana;
  font-weight: bold;
  font-size: 20px;
  fill: DarkGoldenRod;
}
`
const cssPath = require.resolve('chartist/dist/chartist.min.css')
const styles = customCSS + fs.readFileSync(cssPath, 'utf8')
css(styles)

const opt = {
  width: '1000',
  height: '400',
  chartPadding: { left: 20, right: 30, top: 20, bottom: 10 },
  showArea: true,
  showLine: false,
  showPoint: false,
  low: 0,
  high: 225,
  axisY: {
    showLabel: true,
  },
  axisX: {
    type: chartist.AutoScaleAxis,
    showLabel: true,
    onlyInteger: true,
  },
}

function heightProfile(data) {
  let div = document.createElement('div')
  document.querySelector('svg').appendChild(div)
  let chart = new chartist.Line(div, data, opt)
  return new Promise((resolve) => {
    chart.on('created', () => {
      let svg = div.querySelector('svg')
      //svg.setAttribute('height', opt.height)
      window.setComputedStyle(div)
      let txt = div.innerHTML
      div.parentNode.removeChild(div)
      resolve(txt)
    })
  })
}
module.exports = heightProfile
