// Each published image requires exact-area, 2026 capture and reuse evidence.
const evidence = {
  capturedAt: '2026-11-04T19:04:06.870Z',
  author: 'Copernicus Sentinel-2',
  notice: 'Contains modified Copernicus Sentinel data 2026',
  source: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_10SFG_20261104_0_L2A',
  license: 'Copernicus open data terms',
  licenseUrl: 'https://ads.atmosphere.copernicus.eu/licences/ec-sentinel',
  resolution: '10 m per source pixel',
} as const
export const CITY_PHOTOS = {
  'Mountain House': {
    ...evidence,
    file: 'mountain-house-sentinel-20261104',
    alt: 'November 4, 2026 true-color satellite view of Mountain House, including neighborhoods and surrounding farmland',
    caption: 'Mountain House · satellite capture November 4, 2026',
    bbox: [-121.575, 37.745, -121.515, 37.795],
  },
  Tracy: {
    ...evidence,
    file: 'tracy-sentinel-20261104',
    alt: 'November 4, 2026 true-color satellite view of central and eastern Tracy, including its street grid and industrial district',
    caption: 'Tracy · satellite capture November 4, 2026',
    bbox: [-121.465, 37.700, -121.395, 37.765],
  },
} as const
export type PhotoCity = keyof typeof CITY_PHOTOS
