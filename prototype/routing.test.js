import test from 'node:test';
import assert from 'node:assert/strict';
import { route, makeTerrain } from './routing.js';
const flat = () =>
  Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ({ slope: 0, roughness: 0 })));
test('shortest path and zero distance', () => {
  assert.equal(route(flat(), [0, 0], [2, 2]).distanceKm, 0.4);
  assert.equal(route(flat(), [1, 1], [1, 1]).distanceKm, 0);
});
test('barrier is unreachable', () => {
  const g = flat();
  g[1].forEach((c) => (c.slope = 40));
  assert.equal(route(g, [0, 0], [2, 2], 25), null);
});
test('risk penalty favors a longer safe path', () => {
  const g = flat();
  g[1][1].roughness = 10;
  assert.equal(route(g, [0, 1], [2, 1], 25, 0).path.length, 3);
  assert.equal(route(g, [0, 1], [2, 1], 25, 3).path.length, 5);
});
test('invalid endpoints rejected', () => {
  assert.equal(route(flat(), [-1, 0], [2, 2]), null);
  assert.equal(route(flat(), [0.5, 0], [2, 2]), null);
  assert.equal(route([], [0, 0], [1, 1]), null);
});
test('demo route obeys constraints', () => {
  const g = makeTerrain(),
    r = route(g, [1, 1], [22, 22]);
  assert.ok(r);
  r.path.forEach(([x, y], i) => {
    assert.ok(g[y][x].slope <= 25);
    if (i) {
      const [px, py] = r.path[i - 1];
      assert.equal(Math.abs(x - px) + Math.abs(y - py), 1);
    }
  });
});
