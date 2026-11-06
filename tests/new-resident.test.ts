import test from "node:test";
import assert from "node:assert/strict";
import {
  RESIDENT_CITIES,
  RESIDENT_RESOURCES,
  residentLinks,
} from "../lib/new-resident";
test("resident resources cover exactly the four relaunch cities with official destinations", () => {
  assert.deepEqual(
    RESIDENT_CITIES.map((c) => c.name),
    ["Mountain House", "Tracy", "Lathrop", "Manteca"],
  );
  assert.deepEqual(
    Object.keys(RESIDENT_RESOURCES).sort(),
    RESIDENT_CITIES.map((c) => c.slug).sort(),
  );
  for (const city of RESIDENT_CITIES) {
    const r = RESIDENT_RESOURCES[city.slug];
    assert.ok(r.utilities.length >= 2);
    assert.ok(r.schools.length >= 2);
    for (const link of [...r.utilities, ...r.schools])
      assert.equal(new URL(link.href).protocol, "https:");
  }
  assert.match(
    RESIDENT_RESOURCES["mountain-house"].utilities
      .map((r) => r.detail)
      .join(" "),
    /West Valley Disposal/,
  );
  assert.match(
    RESIDENT_RESOURCES.lathrop.utilities.map((r) => r.title).join(" "),
    /Republic Services/,
  );
});
test("resident discovery links preserve each city", () => {
  for (const city of RESIDENT_CITIES)
    for (const href of Object.values(residentLinks(city.name)))
      assert.equal(
        new URL(href, "https://www.moholocal.com").searchParams.get("city"),
        city.name,
      );
});
