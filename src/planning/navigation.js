import { intersectsZone, zoneError } from './exclusions.js';
export function toCell(grid, coordinate) {
  const x = Math.floor(
    (coordinate[0] * grid.metersPerDegreeX - grid.originX) / grid.resolutionMeters,
  );
  const y = Math.floor(
    (grid.originY - coordinate[1] * grid.metersPerDegreeY) / grid.resolutionMeters,
  );
  return x >= 0 && y >= 0 && x < grid.width && y < grid.height ? y * grid.width + x : -1;
}
export function cellCoordinate(grid, index) {
  return [
    (grid.originX + ((index % grid.width) + 0.5) * grid.resolutionMeters) / grid.metersPerDegreeX,
    (grid.originY - (Math.floor(index / grid.width) + 0.5) * grid.resolutionMeters) /
      grid.metersPerDegreeY,
  ];
}
class PriorityQueue {
  entries = [];
  push(entry) {
    let index = this.entries.length;
    this.entries.push(entry);
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.entries[parent].priority <= entry.priority) break;
      this.entries[index] = this.entries[parent];
      index = parent;
    }
    this.entries[index] = entry;
  }
  pop() {
    const first = this.entries[0],
      last = this.entries.pop();
    if (this.entries.length && last) {
      let index = 0;
      while (index * 2 + 1 < this.entries.length) {
        let child = index * 2 + 1;
        if (
          child + 1 < this.entries.length &&
          this.entries[child + 1].priority < this.entries[child].priority
        )
          child++;
        if (last.priority <= this.entries[child].priority) break;
        this.entries[index] = this.entries[child];
        index = child;
      }
      this.entries[index] = last;
    }
    return first;
  }
}
export function terrainRoute(grid, start, destination, maxSlope, exclusions = []) {
  if (!Number.isFinite(maxSlope) || maxSlope <= 0 || maxSlope > 45)
    return { error: 'Choose a slope threshold between 0 and 45 degrees.' };
  if (exclusions.some((zone) => zoneError(zone)))
    return { error: 'An exclusion has invalid data.' };
  const blocked = new Uint8Array(grid.width * grid.height);
  if (exclusions.length)
    for (let index = 0; index < blocked.length; index++) {
      const point = cellCoordinate(grid, index);
      // Inflate by the cell half-diagonal so the complete raster cell remains clear.
      blocked[index] = Number(
        exclusions.some((zone) =>
          intersectsZone(point, point, zone, grid.resolutionMeters / Math.sqrt(2) + 0.1),
        ),
      );
    }
  const startIndex = toCell(grid, start),
    endIndex = toCell(grid, destination);
  const passable = (index) =>
    index >= 0 &&
    !blocked[index] &&
    Number.isFinite(grid.slopes[index]) &&
    grid.slopes[index] <= maxSlope &&
    Number.isFinite(grid.elevations[index]);
  if (!passable(startIndex) || !passable(endIndex))
    return {
      error:
        'Base or destination is outside measured coverage, unknown, inside a no-go area, or above the selected slope threshold. Choose another base or threshold.',
    };
  if (startIndex === endIndex)
    return { error: 'The base and destination occupy the same 20 m grid cell.' };
  const count = grid.width * grid.height,
    costs = new Float64Array(count).fill(Infinity),
    previous = new Int32Array(count).fill(-1),
    closed = new Uint8Array(count),
    queue = new PriorityQueue();
  const heuristic = (index) =>
    Math.hypot(
      (index % grid.width) - (endIndex % grid.width),
      Math.floor(index / grid.width) - Math.floor(endIndex / grid.width),
    ) * grid.resolutionMeters;
  costs[startIndex] = 0;
  queue.push({ index: startIndex, priority: heuristic(startIndex) });
  while (queue.entries.length) {
    const { index } = queue.pop();
    if (closed[index]) continue;
    if (index === endIndex) {
      const cells = [];
      let cursor = index;
      while (cursor !== -1) {
        cells.unshift(cursor);
        cursor = previous[cursor];
      }
      let totalKm = 0;
      const cumulativeKm = [0];
      for (let i = 1; i < cells.length; i++) {
        const a = cells[i - 1],
          b = cells[i];
        totalKm +=
          Math.hypot(
            ((b % grid.width) - (a % grid.width)) * grid.resolutionMeters,
            (Math.floor(b / grid.width) - Math.floor(a / grid.width)) * grid.resolutionMeters,
            grid.elevations[b] - grid.elevations[a],
          ) / 1000;
        cumulativeKm.push(totalKm);
      }
      return {
        cells,
        path: cells.map((cell) => cellCoordinate(grid, cell)),
        cumulativeKm,
        totalKm,
        elevations: cells.map((cell) => grid.elevations[cell]),
        maxSlopeDegrees: Math.max(...cells.map((cell) => grid.slopes[cell])),
      };
    }
    closed[index] = 1;
    const x = index % grid.width,
      y = Math.floor(index / grid.width);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (
          (!dx && !dy) ||
          x + dx < 0 ||
          x + dx >= grid.width ||
          y + dy < 0 ||
          y + dy >= grid.height
        )
          continue;
        const next = (y + dy) * grid.width + x + dx;
        if (closed[next] || !passable(next)) continue;
        // Never cut diagonally across blocked cells.
        if (
          dx &&
          dy &&
          (!passable(y * grid.width + x + dx) || !passable((y + dy) * grid.width + x))
        )
          continue;
        const horizontal = Math.hypot(dx, dy) * grid.resolutionMeters,
          height = grid.elevations[next] - grid.elevations[index];
        const edgeSlope = (Math.atan2(Math.abs(height), horizontal) * 180) / Math.PI;
        if (edgeSlope > maxSlope) continue;
        const candidate =
          costs[index] + Math.hypot(horizontal, height) * (1 + (2 * grid.slopes[next]) / maxSlope);
        if (candidate < costs[next]) {
          costs[next] = candidate;
          previous[next] = index;
          queue.push({ index: next, priority: candidate + heuristic(next) });
        }
      }
  }
  return {
    error:
      'No connected route meets this slope threshold inside the measured window and outside no-go areas. Unknown cells remain blocked.',
  };
}
export function positionAt(route, distanceKm) {
  const distance = Math.max(0, Math.min(route.totalKm, distanceKm));
  let index = 1;
  while (index < route.cumulativeKm.length - 1 && route.cumulativeKm[index] < distance) index++;
  const from = route.path[index - 1],
    to = route.path[index],
    span = route.cumulativeKm[index] - route.cumulativeKm[index - 1];
  const fraction = span > 0 ? (distance - route.cumulativeKm[index - 1]) / span : 0;
  return {
    coordinate: [from[0] + (to[0] - from[0]) * fraction, from[1] + (to[1] - from[1]) * fraction],
    nextIndex: index,
  };
}
export function advanceSimulation(state, routeKm, speedKmh, deltaMinutes) {
  if (
    !state.playing ||
    !Number.isFinite(deltaMinutes) ||
    deltaMinutes <= 0 ||
    !Number.isFinite(speedKmh) ||
    speedKmh <= 0 ||
    !Number.isFinite(routeKm) ||
    routeKm <= 0
  )
    return state;
  const direction = state.phase === 'return' ? -1 : state.phase === 'outbound' ? 1 : 0;
  if (!direction) return state;
  const remaining = direction === 1 ? routeKm - state.distanceKm : state.distanceKm;
  const movingMinutes = Math.min(deltaMinutes, (remaining / speedKmh) * 60);
  const distanceKm = Math.max(
    0,
    Math.min(routeKm, state.distanceKm + (direction * speedKmh * movingMinutes) / 60),
  );
  const arrived = direction === 1 ? distanceKm >= routeKm - 1e-9 : distanceKm <= 1e-9;
  return {
    ...state,
    distanceKm,
    elapsedMinutes: state.elapsedMinutes + movingMinutes,
    phase: arrived ? (direction === 1 ? 'arrived' : 'complete') : state.phase,
    playing: !arrived,
  };
}
