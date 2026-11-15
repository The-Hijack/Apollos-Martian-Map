import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { terrainRoute, cellCoordinate, positionAt, advanceSimulation } from './navigation.js';
const terrain = JSON.parse(readFileSync(new URL('../data/jezero-terrain.json', import.meta.url)));
const base = [77.45, 18.44];
const destination = [77.41359752, 18.45369687];
test('measured Jezero route respects cell, edge and diagonal constraints', () => {
  const route = terrainRoute(terrain, base, destination, 10);
  assert.ok(!route.error);
  assert.ok(route.totalKm > 2 && route.totalKm < 3);
  for (let i = 0; i < route.cells.length; i++) {
    const cell = route.cells[i];
    assert.ok(Number.isFinite(terrain.slopes[cell]) && terrain.slopes[cell] <= 10);
    if (!i) continue;
    const prev = route.cells[i - 1];
    const dx = (cell % terrain.width) - (prev % terrain.width);
    const dy = Math.floor(cell / terrain.width) - Math.floor(prev / terrain.width);
    assert.ok(Math.abs(dx) <= 1 && Math.abs(dy) <= 1);
    const slope =
      (Math.atan2(
        Math.abs(terrain.elevations[cell] - terrain.elevations[prev]),
        Math.hypot(dx, dy) * 20,
      ) *
        180) /
      Math.PI;
    assert.ok(slope <= 10);
    if (dx && dy)
      for (const side of [prev + dx, prev + dy * terrain.width])
        assert.ok(Number.isFinite(terrain.slopes[side]) && terrain.slopes[side] <= 10);
  }
  assert.deepEqual(positionAt(route, -1).coordinate, route.path[0]);
  assert.deepEqual(positionAt(route, route.totalKm + 1).coordinate, route.path.at(-1));
});
test('unknown cells, outside coverage and corner cutting fail closed', () => {
  const grid = {
    width: 2,
    height: 2,
    resolutionMeters: 20,
    originX: 0,
    originY: 40,
    metersPerDegreeX: 1,
    metersPerDegreeY: 1,
    slopes: [0, null, null, 0],
    elevations: [0, 0, 0, 0],
  };
  assert.ok(terrainRoute(grid, cellCoordinate(grid, 0), cellCoordinate(grid, 3), 10).error);
  assert.ok(terrainRoute(grid, cellCoordinate(grid, 0), cellCoordinate(grid, 1), 10).error);
  assert.ok(terrainRoute(terrain, [0, 0], destination, 10).error);
});
test('simulation pauses, rejects invalid speed, stops at arrival and returns without overshoot', () => {
  const paused = { distanceKm: 0, elapsedMinutes: 0, phase: 'outbound', playing: false };
  assert.deepEqual(advanceSimulation(paused, 2, 2, 30), paused);
  const moving = { ...paused, playing: true };
  assert.deepEqual(advanceSimulation(moving, 2, 0, 30), moving);
  const half = advanceSimulation(moving, 2, 2, 30);
  assert.equal(half.distanceKm, 1);
  const slower = advanceSimulation(half, 2, 1, 30);
  assert.equal(slower.distanceKm, 1.5);
  const arrived = advanceSimulation(slower, 2, 1, 100);
  assert.equal(arrived.phase, 'arrived');
  assert.equal(arrived.playing, false);
  assert.equal(arrived.elapsedMinutes, 90);
  const returned = advanceSimulation({ ...arrived, phase: 'return', playing: true }, 2, 2, 100);
  assert.equal(returned.phase, 'complete');
  assert.equal(returned.distanceKm, 0);
  assert.equal(returned.elapsedMinutes, 150);
});
