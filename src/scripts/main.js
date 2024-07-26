import '../styles/tailwind.css'
import initDarkMode from './dark-mode.js'
import initMaps from './maps.js'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import PhotoSwipe from 'photoswipe'

if (DEV_MODE) console.log('Dev mode is currently enabled.')

// handle clicks to toggle the menu
document.getElementById('nav-toggle').onclick = function () {
  document.getElementById('nav-content').classList.toggle('hidden')
}

initDarkMode()

if (
  document.getElementsByClassName('legMap') ||
  document.getElementsByClassName('fullMap')
) {
  initMaps()
}

if (document.getElementsByClassName('gallery')) {
  const lightbox = new PhotoSwipeLightbox({
    gallery: '.gallery',
    children: 'a',
    pswpModule: PhotoSwipe,
  })

  lightbox.init()
}
