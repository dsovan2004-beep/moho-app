import {test} from 'node:test'
import assert from 'node:assert/strict'
import {existsSync} from 'node:fs'
import {CITY_PHOTOS} from '../lib/city-photos'
test('published city views satisfy the required 2026 acquisition and geographic evidence',()=>{
  for (const [city,photo] of Object.entries(CITY_PHOTOS)) {
    assert.equal(new Date(photo.capturedAt).getUTCFullYear(),2026)
    if (photo.kind === 'satellite') {
      assert.match(photo.caption,/satellite capture November 4, 2026/)
      assert.match(photo.source,/S2B_10SFG_20261104_0_L2A$/)
      assert.match(photo.notice,/Contains modified Copernicus Sentinel data 2026/)
    } else {
      assert.match(photo.caption,/Ninth Street, Tracy · July 8, 2026/)
      assert.match(photo.source,/pKey=2915180395489942$/)
      assert.equal(photo.license,'CC BY-SA 4.0')
      assert.ok(photo.imagePoint.latitude>photo.bbox[1] && photo.imagePoint.latitude<photo.bbox[3])
      assert.ok(photo.imagePoint.longitude>photo.bbox[0] && photo.imagePoint.longitude<photo.bbox[2])
    }
    for(const width of [800,1600])assert.ok(existsSync(`public/images/cities/${photo.file}-${width}.webp`))
    const lon=city==='Mountain House' ? -121.54417 : -121.4252
    const lat=city==='Mountain House' ? 37.77389 : 37.7397
    assert.ok(photo.bbox[0]<lon&&photo.bbox[2]>lon&&photo.bbox[1]<lat&&photo.bbox[3]>lat)
  }
})
