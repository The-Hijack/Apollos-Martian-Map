import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { intersectsZone, manualRoute, loadZones, zonesKey, routeConflicts } from './exclusions.js';
import { terrainRoute } from './navigation.js';
import { saveNote, readNotes, journalKey, JOURNAL_KEY } from './journal.js';
const zone = (center = [0, 0], radiusMeters = 100) => ({
  id: 'test-zone',
  missionId: 'spirit',
  title: 'Suspected weak soil',
  reason: 'Test manual exclusion, not measured.',
  center,
  radiusMeters,
  source: '',
  createdAt: '2026-11-15T00:00:00Z',
  basis: 'manual',
});
test('segment crossing is rejected even when both endpoints are outside the zone', () => {
  const area = zone();
  assert.equal(intersectsZone([-0.01, 0], [0.01, 0], area), true);
  assert.ok(
    manualRoute(
      [
        [-0.01, 0],
        [0.01, 0],
      ],
      [area],
      [0, 0],
    ).error,
  );
  assert.equal(intersectsZone([-0.01, 0.01], [0.01, 0.01], area), false);
});
test('manual detour clears exclusions without claiming slope information', () => {
  const result = manualRoute(
    [
      [-0.01, 0],
      [-0.01, 0.01],
      [0.01, 0.01],
      [0.01, 0],
    ],
    [zone()],
    [0, 0],
  );
  assert.ok(!result.error);
  assert.equal(result.elevations.length, 0);
  assert.equal(routeConflicts(result.path, [zone()]).length, 0);
});
test('invalid and identical endpoints fail closed; distant manual bases are allowed', () => {
  assert.ok(
    manualRoute(
      [
        [0, 0],
        [0, 0],
      ],
      [],
      [0, 0],
    ).error,
  );
  assert.ok(
    manualRoute(
      [
        [0, 0],
        [2, 0],
      ],
      [],
      [0, 0],
    ).totalKm > 10,
  );
  assert.ok(
    manualRoute(
      [
        [NaN, 0],
        [0.01, 0],
      ],
      [],
      [0, 0],
    ).error,
  );
  assert.ok(
    manualRoute(
      [
        [0, 0],
        [0.01, 0],
      ],
      [zone([0, 0], -1)],
      [0, 0],
    ).error,
  );
});
test('measured Jezero path reroutes around an entered exclusion', () => {
  const grid = JSON.parse(readFileSync(new URL('../data/jezero-terrain.json', import.meta.url)));
  const start = [77.45, 18.44],
    end = [77.41359752, 18.45369687];
  const original = terrainRoute(grid, start, end, 10);
  assert.ok(!original.error);
  const area = {
    ...zone(original.path[Math.floor(original.path.length / 2)], 60),
    missionId: 'perseverance',
  };
  const revised = terrainRoute(grid, start, end, 10, [area]);
  assert.ok(!revised.error);
  assert.notDeepEqual(revised.cells, original.cells);
  assert.equal(routeConflicts(revised.path, [area]).length, 0);
  assert.ok(terrainRoute(grid, start, end, 10, [{ ...area, center: start }]).error);
});
test('excluded boundaries and notebooks stay isolated by mission, preserving legacy Jezero notes', () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  storage.setItem(zonesKey('spirit'), JSON.stringify([zone()]));
  assert.equal(loadZones(storage, 'spirit').length, 1);
  assert.equal(loadZones(storage, 'phoenix').length, 0);
  storage.setItem(zonesKey('phoenix'), JSON.stringify([zone()]));
  assert.throws(() => loadZones(storage, 'phoenix'));
  const note = {
    id: 'note',
    title: 'Surface',
    observation: 'Demo observation',
    coordinates: [175, -14],
    createdAt: '2026-11-15',
    locationContext: 'Simulation',
  };
  saveNote(storage, [], note, 'spirit');
  assert.equal(readNotes(storage, 'spirit').length, 1);
  assert.equal(readNotes(storage, 'viking1').length, 0);
  assert.equal(journalKey('perseverance'), JOURNAL_KEY);
});
