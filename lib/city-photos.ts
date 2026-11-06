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
    kind: 'satellite',
    authorUrl: evidence.source,
    adaptation: 'Geographic crop / resized',
    processing: 'Geographic crop of the provider’s true-color product; resized to WebP. No generated geographic detail.',
    file: 'mountain-house-sentinel-20261104',
    alt: 'November 4, 2026 true-color satellite view of Mountain House, including neighborhoods and surrounding farmland',
    caption: 'Mountain House · satellite capture November 4, 2026',
    bbox: [-121.575, 37.745, -121.515, 37.795],
  },
  Tracy: {
    kind: 'street',
    capturedAt: '2026-07-08',
    file: 'tracy-ninth-street-20260708',
    alt: 'Street-level photograph of Ninth Street in Tracy, with trees, a water tower and civic buildings, captured July 8, 2026',
    caption: 'Ninth Street, Tracy · July 8, 2026',
    author: 'marker_geo1 / Mapillary',
    authorUrl: 'https://www.mapillary.com/app/user/marker_geo1',
    source: 'https://www.mapillary.com/app/?lat=37.73753898838463&lng=-121.42041054990091&z=18&pKey=2915180395489942',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    notice: 'Photo by marker_geo1, via Mapillary',
    adaptation: 'Perspective crop / resized',
    processing: 'Perspective view projected from a real 360° photograph and resized to WebP. No scenery generated; source blurring retained. This adaptation remains CC BY-SA 4.0.',
    resolution: '2048 × 1024 downloaded panorama',
    bbox: [-121.465, 37.700, -121.395, 37.765],
    imagePoint: { latitude: 37.73753898838463, longitude: -121.42041054990091 },
  },
} as const
export type PhotoCity = keyof typeof CITY_PHOTOS
