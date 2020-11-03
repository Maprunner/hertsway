# There and Back on the Hertfordshire Way

Built with [11ty](https://www.11ty.dev/) and [Tailwind CSS](https://tailwindcss.com/docs).

# Running locally

- npm run dev

## Adding a new leg

- Create new post in src/posts
- Add details to globals/legs.js
- Add picture details to globals/pics.js
- Add pictures (600x400) to src/images
- Save gpx file in src/data
- (Following bits need some more work...)
- Load gpx file from the Map page and extract details from console output
- Overwrite gpx file with filtered gpx from console output
- Add new map centre entry to legsLonLat in src/scripts/main.js based on averages from console output

## Deploying

- npm run build
- Sync dist to www.maprunner.co.uk/hertsway

## Credits

- This project was initially based on the [11r starter template](https://reeseschultz.github.io/11r/) by [Reese Schultz](https://reeseschultz.com).
