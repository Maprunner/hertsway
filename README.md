# There and Back on the Hertfordshire Way

Built with [11ty](https://www.11ty.dev/) and [Tailwind CSS](https://tailwindcss.com/docs).

# Running locally

- npm run dev

## Adding a new leg

- Save gpx file in src/data as legx.gpx
- npm run new <x> <from> <to>
- Edit post
- npm run dev to test

## Pictures

- Add picture details to globals/pics.js
- Add pictures (3000+ jpg) to OneDrive hertsway/rawimages
- npm run resize x creates images for everything in pics.js for leg x
- npm run resize pan creates images for everything in panoramas.js for banners

## Deploying

- npm run build
- Sync dist to www.maprunner.co.uk/hertsway

## Credits

- This project was initially based on the [11r starter template](https://reeseschultz.github.io/11r/) by [Reese Schultz](https://reeseschultz.com).
