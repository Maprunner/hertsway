import '../styles/tailwind.css'
import initDarkMode from './dark-mode.js'
import initPhotoswipe from './photoswipe-dom.js'
import initMaps from './maps.js'

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
  initPhotoswipe('.gallery')
}
