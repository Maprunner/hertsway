const pans = [
  // entry 0 is used for the front page
  // entries 1 to 30 are used for the associated leg
  // anythng after that is just used randomly
  {
    src: 'pan-1.jpg',
    caption: 'Leg 2 Clothall',
  },
  {
    src: 'pan-29.jpg',
    caption: 'Leg 1 Fallow deer near Therfield',
  },
  {
    src: 'pan-1.jpg',
    caption: 'Leg 2 Clothall',
  },
  {
    src: 'pan-27.jpg',
    caption: 'Leg 3 Chesfield',
  },
  {
    src: 'pan-28.jpg',
    caption: 'Leg 4 Almshoe Bury',
  },
  {
    src: 'pan-2.jpg',
    caption: 'Leg 5 Kimpton',
  },
  {
    src: 'pan-9.jpg',
    caption: "Leg 6 Devil's Dyke, Wheathampstead",
  },
  {
    src: 'pan-11.jpg',
    caption: 'Leg 7 St Albans',
  },
  {
    src: 'pan-30.jpg',
    caption: 'Leg 8 Stonechat near Flamstead',
  },
  {
    src: 'pan-12.jpg',
    caption: 'Leg 9 Jockey End',
  },
  {
    src: 'pan-16.jpg',
    caption: 'Leg 10 Aldbury and Ashridge',
  },
  {
    src: 'pan-19.jpg',
    caption: 'Leg 11 Red kite at Bovingdon Airfield',
  },
  {
    src: 'pan-21.jpg',
    caption: 'Leg 12 Apsley Marina',
  },
  {
    src: 'pan-22.jpg',
    caption: 'Leg 13 M25 near Kings Langley',
  },
  {
    src: 'pan-7.jpg',
    caption: 'Leg 14 Shenley',
  },
  {
    src: 'pan-31.jpg',
    caption: 'Leg 15 Catharine Bourne near South Mimms',
  },
  {
    src: 'pan-8.jpg',
    caption: 'Leg 16 Gobions Wood',
  },
  {
    src: 'pan-32.jpg',
    caption: 'Leg 17 Fog at Newgate Street',
  },
  {
    src: 'pan-33.jpg',
    caption: 'Leg 18 Redwings near Little Berkhamsted',
  },
  {
    src: 'pan-5.jpg',
    caption: 'Leg 19 Bayford',
  },
  {
    src: 'pan-34.jpg',
    caption: 'Leg 20 Cuffley Viaduct',
  },
  {
    src: 'pan-36.jpg',
    caption: 'Leg 21 New River, Hoddesdon',
  },
  {
    src: 'pan-38.jpg',
    caption: 'Leg 22 Roydon',
  },
  {
    src: 'pan-6.jpg',
    caption: "Leg 23 King's Meads",
  },
  {
    src: 'pan-14.jpg',
    caption: 'Leg 24 Woodhall Park',
  },
  {
    src: 'pan-3.jpg',
    caption: 'Leg 25 Widford',
  },
  {
    src: 'pan-39.jpg',
    caption: "Leg 26 St Andrew's Church, Much Hadham",
  },
  {
    src: 'pan-41.jpg',
    caption: 'Leg 27 Buzzard near Upwick Green',
  },
  {
    src: 'pan-26.jpg',
    caption: 'Leg 1 Therfield Heath',
  },
  {
    src: 'pan-10.jpg',
    caption: 'Leg 6 Heartwood Forest',
  },
  {
    src: 'pan-13.jpg',
    caption: 'Leg 9 Great Gaddesden',
  },
  {
    src: 'pan-15.jpg',
    caption: 'Leg 10 Little Gaddesden',
  },
  {
    src: 'pan-17.jpg',
    caption: 'Leg 10 Great Gaddesden',
  },
  {
    src: 'pan-18.jpg',
    caption: 'Leg 11 Grand Union Canal, Bourne End',
  },
  {
    src: 'pan-20.jpg',
    caption: 'Leg 11 Berkhamsted',
  },
  {
    src: 'pan-23.jpg',
    caption: 'Leg 13 M25 near Abbots Langley',
  },
  {
    src: 'pan-24.jpg',
    caption: 'Leg 13 Bricket Wood Common',
  },
  {
    src: 'pan-25.jpg',
    caption: 'Leg 13 Munden Estate',
  },
  {
    src: 'pan-35.jpg',
    caption: 'Leg 21 New River, Hoddesdon',
  },
  {
    src: 'pan-37.jpg',
    caption: 'Leg 22 Little egret by the River Ash',
  },
  {
    src: 'pan-4.jpg',
    caption: 'Leg 24 Tonwell',
  },
  {
    src: 'pan-40.jpg',
    caption: 'Leg 27 Albury',
  },
]

const panSrc = []
const panCaption = []
for (const pan in pans) {
  panSrc.push(pans[pan].src)
  panCaption.push(pans[pan].caption)
}

module.exports = {
  panSrc: panSrc,
  panCaption: panCaption,
  panCount: panSrc.length,
}
