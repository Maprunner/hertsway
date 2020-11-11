const legs = require('./legs.js')

let dist = 0
let climb = 0
let count = 0
let time = 0
for (const leg in legs) {
  count = count + 1
  dist = dist + legs[leg].distance
  climb = climb + legs[leg].climb
  time = time + legs[leg].time
}
module.exports = {
  totalLegs: count,
  totalDistance: dist.toFixed(1),
  totalClimb: climb,
  totalTime: time,
  averageDistance: (dist / count).toFixed(1),
  averageClimb: (climb / count).toFixed(0),
  averageTime: (time / count).toFixed(0),
}
