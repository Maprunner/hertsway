// converts leg10 "A to B" with leg10-a-to-b
module.exports = (leg, title) => {
  return (
    'https://www.maprunner.co.uk/hertsway/post/' +
    leg +
    title.toLowerCase().replace(' to ', ' ').replace(' ', '-') +
    '/'
  )
}
