const legs = require('./legs.js')

let dist = 0
let climb = 0
let count = 0
let time = 0
let legTable = []
for (const leg in legs) {
  let thisLeg = {}
  count = count + 1
  dist = dist + legs[leg].distance
  thisLeg.distance = legs[leg].distance.toFixed(1)
  thisLeg.totDistance = dist.toFixed(1)
  climb = climb + legs[leg].climb
  thisLeg.climb = legs[leg].climb
  thisLeg.totClimb = climb
  time = time + legs[leg].time
  thisLeg.time = legs[leg].time
  thisLeg.totTime = time
  legTable.push(thisLeg)
}
module.exports = {
  legTable: legTable,
  totalLegs: count,
  totalDistance: dist.toFixed(1),
  totalClimb: climb,
  totalTime: time,
  averageDistance: (dist / count).toFixed(1),
  averageClimb: (climb / count).toFixed(0),
  averageTime: (time / count).toFixed(0),
}
