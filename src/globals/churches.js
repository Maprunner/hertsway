const allPics = require('./pics.js')
// extracts an array of all church photos
let churches = []
for (let idx in allPics) {
  const pics = allPics[idx]
  for (let i = 0; i < pics.length; i = i + 1) {
    const bits = pics[i].src.replace('.jpg', '').split('-')
    // any picture with a name that ends "-church.jpg" is a church
    if (bits[bits.length - 1] === 'church') {
      if (idx === 'ch') {
        pics[i].idx = 'ch'
      } else {
        // pictures assumed to start "legx"
        pics[i].leg = bits[0]
        pics[i].idx = bits[0]
      }
      churches.push(pics[i])
    }
  }
}
churches.sort(function (a, b) {
  return (
    parseInt(a.leg.replace('leg', ''), 10) -
    parseInt(b.leg.replace('leg', ''), 10)
  )
})

module.exports = {
  churches,
}
