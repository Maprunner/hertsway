// based on https://www.markllobrera.com/posts/eleventy-building-image-gallery-photoswipe/

import PhotoSwipeLightbox from 'photoswipe'
import PhotoSwipe from 'photoswipe'

export default (gallerySelector) => {
  const imageSizes = {
    'gallery-3x2': {
      small: {
        width: 600,
        height: 400,
        suffix: '-600.jpg',
      },
      large: {
        width: 1200,
        height: 800,
        suffix: '-1200.jpg',
      },
    },
    'gallery-2x3': {
      small: {
        width: 400,
        height: 600,
        suffix: '-400.jpg',
      },
      large: {
        width: 800,
        height: 1200,
        suffix: '-800.jpg',
      },
    },
  }

  // parse slide data (url, title, size ...) from DOM elements
  // (children of gallerySelector)
  const parseThumbnailElements = function (el) {
    const thumbElements = el.querySelectorAll('figure')
    const numNodes = thumbElements.length
    const items = []

    for (let i = 0; i < numNodes; i++) {
      const figureEl = thumbElements[i]

      // include only element nodes
      if (figureEl.nodeType !== 1) {
        continue
      }

      const linkEl = figureEl.children[0] // <a> element

      //   size = linkEl.getAttribute('data-size').split('x');
      const sizeId = linkEl.getAttribute('data-size')
      const size = imageSizes[sizeId]

      // create slide object
      let item = {
        src: linkEl.getAttribute('href'),
        orig_src: linkEl.getAttribute('href'),
        small: size.small,
        large: size.large,
      }

      if (figureEl.children.length > 1) {
        // <figcaption> content
        item.title = figureEl.children[1].innerHTML
      }

      if (linkEl.children.length > 0) {
        // <img> thumbnail element, retrieving thumbnail url
        item.msrc = linkEl.children[0].getAttribute('src')
      }

      item.el = figureEl // save link to element for getThumbBoundsFn
      items.push(item)
    }

    return items
  }

  // find nearest parent element
  const closest = function closest(el, fn) {
    return el && (fn(el) ? el : closest(el.parentNode, fn))
  }

  // triggers when user clicks on Gallery
  const onGalleryClick = function (e) {
    e = e || window.event
    e.preventDefault ? e.preventDefault() : (e.returnValue = false)

    const eTarget = e.target || e.srcElement

    // find root element of slide
    const clickedListItem = closest(eTarget, function (el) {
      return el.tagName && el.tagName.toUpperCase() === 'FIGURE'
    })

    if (!clickedListItem) {
      return
    }

    const clickedGallery = document.querySelector(gallerySelector)
    const index = parseInt(clickedListItem.dataset.index, 10)

    if (index >= 0) {
      // open PhotoSwipe if valid index found
      openPhotoSwipe(index, clickedGallery)
    }
    return false
  }

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  const photoswipeParseHash = function () {
    const hash = window.location.hash.substring(1)
    let params = {}

    if (hash.length < 5) {
      return params
    }

    const vars = hash.split('&')
    for (let i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        continue
      }
      const pair = vars[i].split('=')
      if (pair.length < 2) {
        continue
      }
      params[pair[0]] = pair[1]
    }

    if (params.gid) {
      params.gid = parseInt(params.gid, 10)
    }

    return params
  }

  const openPhotoSwipe = function (
    index,
    galleryElement,
    disableAnimation,
    fromURL
  ) {
    const items = parseThumbnailElements(galleryElement)

    // define options (if needed)
    let options = {
      // define gallery index (for URL)
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),

      // dataSource: items,

      getThumbBoundsFn: function (index) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        const thumbnail = items[index].el.getElementsByTagName('img')[0]
        const pageYScroll =
          window.pageYOffset || document.documentElement.scrollTop
        const rect = thumbnail.getBoundingClientRect()

        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width }
      },
    }

    // PhotoSwipe opened from URL
    if (fromURL) {
      if (options.galleryPIDs) {
        // parse real index when custom PIDs are used
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for (let j = 0; j < items.length; j++) {
          if (items[j].pid == index) {
            options.index = j
            break
          }
        }
      } else {
        // in URL indexes start from 1
        options.index = parseInt(index, 10) - 1
      }
    } else {
      options.index = parseInt(index, 10)
    }

    // exit if index not found
    if (isNaN(options.index)) {
      return
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0
    }

    let lightbox = new PhotoSwipeLightbox({
      gallery: '#leg-gallery',
      children: 'figure',
      pswpModule: () => import('photoswipe'),
    })

    let imageSize = 'small'
    let firstResize = true
    let imageSrcWillChange = false

    // beforeResize event fires each time size of lightbox viewport updates
    lightbox.on('contentResize', function () {
      // lightbox.viewportSize.x - width of PhotoSwipe viewport
      // lightbox.viewportSize.y - height of PhotoSwipe viewport
      // window.devicePixelRatio - ratio between physical pixels and device independent pixels (Number)
      //                          1 (regular display), 2 (@2x, retina) ...

      // calculate real pixels when size changes
      // realViewportWidth = lightbox.viewportSize.x * window.devicePixelRatio;
      const realViewportWidth = lightbox.viewportSize.x

      // Code below is needed if you want image to switch dynamically on window.resize

      // Find out if current images need to be changed
      if (realViewportWidth < 768) {
        if (imageSize != 'small') {
          imageSize = 'small'
          imageSrcWillChange = true
        }
      } else {
        if (imageSize != 'large') {
          imageSize = 'large'
          imageSrcWillChange = true
        }
      }

      // Invalidate items only when source is changed and when it's not the first update
      if (imageSrcWillChange && !firstResize) {
        // invalidateCurrItems sets a flag on slides that are in DOM,
        // which will force update of content (image) on window.resize.
        lightbox.invalidateCurrItems()
      }

      if (firstResize) {
        firstResize = false
      }

      imageSrcWillChange = false
    })

    // gettingData event fires each time PhotoSwipe retrieves image source & size
    lightbox.listen('gettingData', function (index, item) {
      // Set image source & size based on real viewport width
      item.src = item.orig_src.replace('.jpg', '') + item[imageSize].suffix
      item.w = item[imageSize].width
      item.h = item[imageSize].height
    })

    lightbox.init()
  }
  const lightbox = new PhotoSwipeLightbox({
    gallery: '#leg-gallery',
    children: 'figure',
    pswpModule: PhotoSwipe,
  })

  lightbox.init()
  // loop through all gallery elements and bind events
  // let galleryElements = document.querySelectorAll(gallerySelector)
  // for (let i = 0; i < galleryElements.length; i++) {
  //   galleryElements[i].setAttribute('data-pswp-uid', i + 1)
  //   galleryElements[i].onclick = onGalleryClick
  // }
  // const hashData = photoswipeParseHash()
  // if (hashData.pid && hashData.gid) {
  //   openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true)
  // }
}
