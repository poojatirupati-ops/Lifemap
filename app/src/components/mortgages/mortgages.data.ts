// Mortgages page pictures (the journeys themselves come from the CMS).

/** Pictures for video cards without a poster, and for the reading cards, taken in turn. */
export const VIDEO_PHOTOS = [
  'home-keys',
  'house-for-sale',
  'money-plant',
  'invest-charts',
  'couple-planning',
]
export const READING_PHOTOS = ['home-keys', 'savings-jar', 'invest-charts']

export const photo = (name: string) => `media/${name}.jpg`

/** The picture for the i-th card, cycling through the list. */
export const photoAt = (names: string[], i: number) => photo(names[i % names.length])
