import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Load the actual TypeScript catalogs without adding a production dependency.
const directory = dirname(fileURLToPath(import.meta.url));
const cache = new Map();
function loadCatalog(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const requireLocal = (name) => loadCatalog(resolve(dirname(file), `${name}.ts`));
  new Function('require', 'module', 'exports', code)(requireLocal, module, module.exports);
  return module.exports;
}
const { missions } = loadCatalog(resolve(directory, 'missions.ts'));
const { media, explorations } = loadCatalog(resolve(directory, 'exploration.ts'));
const { pointsOfInterest } = loadCatalog(resolve(directory, 'pointsOfInterest.ts'));

test('all eight contributed missions remain connected with usable Mars coordinates and science records', () => {
  assert.deepEqual(missions.map((mission) => mission.id).sort(), [
    'curiosity',
    'insight',
    'opportunity',
    'pathfinder',
    'perseverance',
    'phoenix',
    'spirit',
    'viking1',
  ]);
  for (const mission of missions) {
    const [longitude, latitude] = mission.coordinates;
    assert.ok(longitude >= -180 && longitude <= 180, mission.id);
    assert.ok(latitude >= -90 && latitude <= 90, mission.id);
    assert.ok(explorations[mission.id]?.length > 0, `${mission.id} science records disconnected`);
  }
});
test('every local catalog image exists and mapped evidence links resolve', () => {
  for (const [missionId, images] of Object.entries(media)) {
    assert.ok(missions.some((mission) => mission.id === missionId));
    assert.equal(new Set(images.map((item) => item.id)).size, images.length);
    for (const item of images) {
      assert.ok(item.source.startsWith('https://'));
      if (item.src.startsWith('/'))
        assert.ok(existsSync(resolve(directory, '../../public', item.src.slice(1))), item.src);
    }
  }
  for (const [missionId, locations] of Object.entries(pointsOfInterest)) {
    assert.ok(missions.some((mission) => mission.id === missionId));
    for (const location of locations)
      assert.ok(
        media[missionId]?.some((item) => item.id === location.mediaId),
        `${missionId}: ${location.mediaId}`,
      );
  }
});

// Every contributed region must support its own manual planning geometry.
test('all seven non-Jezero missions can rehearse a local route using their own coordinates', async () => {
  const { manualRoute } = await import('../planning/exclusions.js');
  for (const mission of missions.filter((item) => item.id !== 'perseverance')) {
    const base = [mission.coordinates[0] + 0.01, mission.coordinates[1]];
    const result = manualRoute([base, mission.coordinates], [], mission.coordinates);
    assert.ok(!result.error, mission.id);
    assert.deepEqual(result.path.at(-1), mission.coordinates);
    assert.ok(result.totalKm > 0);
    assert.equal(result.elevations.length, 0);
  }
});
