const css = require('svgdom-css')
const chartist = require('chartist')
const fs = require('fs')

const cssPath = require.resolve('chartist/dist/chartist.min.css')
const styles = fs.readFileSync(cssPath, 'utf8')
css(styles)

const opt = {
  width: '1000',
  height: '200',
  //chartPadding: { left: 20, right: 200 },
  showArea: true,
  showLine: false,
  showPoint: false,
  low: 0,
  high: 225,
  axisX: {
    type: chartist.AutoScaleAxis,
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
      svg.setAttribute('viewbox', '0 0 1000 200')
      svg.setAttribute('style', 'background-color: #fff')
      window.setComputedStyle(div)
      let txt = div.innerHTML
      div.parentNode.removeChild(div)
      resolve(txt)
    })
  })
}
module.exports = heightProfile
