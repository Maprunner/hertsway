const allPics = require('./pics.js')

let churches = []
for (let idx in allPics) {
  const pics = allPics[idx]
  for (let i = 0; i < pics.length; i = i + 1) {
    const bits = pics[i].src.replace('.jpg', '').split('-')
    if (bits[bits.length - 1] === 'church') {
      pics[i].leg = bits[0]
      churches.push(pics[i])
    }
  }
}
module.exports = {
  churches,
}
