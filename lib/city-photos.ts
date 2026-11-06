// Only location-checked, rights-reviewed photographs belong here.
export const CITY_PHOTOS = {
  'Mountain House': {
    file: 'mountain-house-naip-2024',
    alt: 'Aerial photograph of Mountain House neighborhoods, parks and the creek corridor',
    caption: 'Mountain House from above · May 2024',
    author: 'USDA NAIP',
    source: 'https://apps.geo.fpac.usda.gov/geo-imagery/rest/services/naip/conus_naip/ImageServer',
    license: 'Public domain',
    licenseUrl: 'https://catalog.data.gov/dataset/national-agriculture-imagery-program-naip-imagery',
  },
  Tracy: {
    file: 'tracy-downtown-archival',
    alt: 'Historic storefronts and street trees in downtown Tracy at dusk',
    caption: 'Downtown Tracy · archival photograph',
    author: 'Mark E. Robertson',
    source: 'https://commons.wikimedia.org/wiki/File:Downtown_Tracy.jpeg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
} as const
export type PhotoCity = keyof typeof CITY_PHOTOS
