export function makeTerrain(size = 24) {
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      const ridge = x > 9 && x < 14 && y > 3 && y < 20 && y !== 14;
      return { slope: ridge ? 32 : (x * 7 + y * 11) % 19, roughness: ((x * 3 + y * 7) % 10) / 10 };
    }),
  );
}
// Dijkstra over four-neighbor cells. Cell size is a simulated 100 m.
export function route(grid, start, end, maxSlope = 25, riskWeight = 3) {
  if (
    !grid.length ||
    !grid[0]?.length ||
    !Number.isFinite(maxSlope) ||
    !Number.isFinite(riskWeight) ||
    riskWeight < 0
  )
    return null;
  const h = grid.length,
    w = grid[0].length;
  const valid = ([x, y]) =>
    Number.isInteger(x) &&
    Number.isInteger(y) &&
    x >= 0 &&
    y >= 0 &&
    x < w &&
    y < h &&
    Number.isFinite(grid[y]?.[x]?.slope) &&
    grid[y][x].slope <= maxSlope;
  if (!valid(start) || !valid(end)) return null;
  const key = ([x, y]) => y * w + x,
    pending = new Set([key(start)]),
    costs = new Map([[key(start), 0]]),
    previous = new Map();
  while (pending.size) {
    const current = [...pending].reduce((a, b) => (costs.get(a) < costs.get(b) ? a : b));
    pending.delete(current);
    if (current === key(end)) {
      const path = [];
      let k = current;
      while (k !== undefined) {
        path.unshift([k % w, Math.floor(k / w)]);
        k = previous.get(k);
      }
      return { path, distanceKm: (path.length - 1) * 0.1, cost: costs.get(current) };
    }
    const x = current % w,
      y = Math.floor(current / w);
    for (const next of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      if (!valid(next)) continue;
      const cell = grid[next[1]][next[0]];
      const cost = costs.get(current) + 1 + riskWeight * (cell.slope / 45 + cell.roughness);
      const k = key(next);
      if (cost < (costs.get(k) ?? Infinity)) {
        costs.set(k, cost);
        previous.set(k, current);
        pending.add(k);
      }
    }
  }
  return null;
}
