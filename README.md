# There and Back on the Hertfordshire Way

Built with [11ty](https://www.11ty.dev/) and [Tailwind CSS](https://tailwindcss.com/docs).

# Running locally

- npm run dev

## Adding a new leg

- Create new post in src/posts
- Add details to globals/legs.js
- Add picture details to globals/pics.js
- Add pictures (600x400 jpg) to src/images
- Save gpx file in src/data as legx.gpx
- npm gpx legx.gpx
- extract details from console output and add new map centre entry to src/scripts/mapLonLat.js
- npm run dev to test
- copy dist/images files to src/images to avoid resizing again

## Deploying

- npm run build
- Sync dist to www.maprunner.co.uk/hertsway

## Credits

- This project was initially based on the [11r starter template](https://reeseschultz.github.io/11r/) by [Reese Schultz](https://reeseschultz.com).
