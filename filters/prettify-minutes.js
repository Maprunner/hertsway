// converts 123 to "2 hours 03 minutes"
module.exports = (mins) => {
  return (
    Math.floor(mins / 60) +
    ' hours ' +
    (mins % 60).toString().padStart(2, '0') +
    ' minutes'
  )
}
