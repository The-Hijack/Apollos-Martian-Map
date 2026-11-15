import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MARS_RADIUS_KM,
  marsDistanceKm,
  marsDestination,
  marsScalePixels,
} from './calculations.js';
const grid = JSON.parse(readFileSync(new URL('../data/jezero-terrain.json', import.meta.url)));
test('distance model matches source GeoTIFF sphere and native 20 m grid', () => {
  assert.equal(MARS_RADIUS_KM * 1000, grid.radiusMeters);
  assert.equal(grid.resolutionMeters, 20);
  assert.ok(Math.abs(grid.metersPerDegreeY - (Math.PI * grid.radiusMeters) / 180) < 1e-8);
  assert.ok(
    Math.abs(
      grid.metersPerDegreeX -
        grid.metersPerDegreeY * Math.cos((grid.standardParallel * Math.PI) / 180),
    ) < 1e-8,
  );
});
test('all ring bearings return the labelled distance at equatorial and polar sites', () => {
  for (const origin of [
    [77.45, 18.44],
    [-125.75, 68.22],
    [179.99, 0],
  ])
    for (const km of [1, 2, 5, 10])
      for (let bearing = 0; bearing < 360; bearing += 15)
        assert.ok(
          Math.abs(marsDistanceKm(origin, marsDestination(origin, km, bearing)) - km) < 1e-8,
        );
});
test('scale pixels match independent spherical arc distances across latitudes and zooms', () => {
  for (const latitude of [0, 18.44, 68.22, -75])
    for (const resolution of [0.00001, 0.001, 0.1, 0.7]) {
      const pixels = marsScalePixels(2, latitude, resolution);
      const delta = pixels * resolution;
      const lat = (latitude * Math.PI) / 180,
        half = (delta * Math.PI) / 360;
      const dot = Math.sin(lat) ** 2 + Math.cos(lat) ** 2 * Math.cos(2 * half);
      const km = MARS_RADIUS_KM * Math.acos(Math.min(1, dot));
      assert.ok(Math.abs(km - 2) < 1e-5);
    }
});
