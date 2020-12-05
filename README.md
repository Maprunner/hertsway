# There and Back on the Hertfordshire Way

Built with [11ty](https://www.11ty.dev/) and [Tailwind CSS](https://tailwindcss.com/docs).

# Running locally

- npm run dev

## Adding a new leg

- Save gpx file in src/data as legx.gpx
- npm run new <x> <from> <to>
- Edit post
- Add picture details to globals/pics.js
- Add pictures (600x400 jpg) to src/images
- npm run dev to test
- copy dist/images to src/images to avoid resizing again

## Deploying

- npm run build
- Sync dist to www.maprunner.co.uk/hertsway

## Credits

- This project was initially based on the [11r starter template](https://reeseschultz.github.io/11r/) by [Reese Schultz](https://reeseschultz.com).
