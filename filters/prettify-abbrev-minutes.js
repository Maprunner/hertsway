// converts 130 to "2h10"
module.exports = (mins) => {
  return Math.floor(mins / 60) + 'h' + (mins % 60).toString().padStart(2, '0')
}
