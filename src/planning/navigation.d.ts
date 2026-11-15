import type { Exclusion } from './exclusions.js';
export interface TerrainGrid {
  width: number;
  height: number;
  resolutionMeters: number;
  originX: number;
  originY: number;
  metersPerDegreeX: number;
  metersPerDegreeY: number;
  slopes: (number | null)[];
  elevations: (number | null)[];
}
export interface TerrainRoute {
  cells: number[];
  path: [number, number][];
  cumulativeKm: number[];
  totalKm: number;
  elevations: number[];
  maxSlopeDegrees: number;
}
export interface SimulationState {
  distanceKm: number;
  elapsedMinutes: number;
  phase: 'outbound' | 'arrived' | 'return' | 'complete';
  playing: boolean;
}
export function toCell(grid: TerrainGrid, coordinate: [number, number]): number;
export function cellCoordinate(grid: TerrainGrid, index: number): [number, number];
export function terrainRoute(
  grid: TerrainGrid,
  start: [number, number],
  destination: [number, number],
  maxSlope: number,
  exclusions?: Exclusion[],
): TerrainRoute | { error: string };
export function positionAt(
  route: TerrainRoute,
  distanceKm: number,
): { coordinate: [number, number]; nextIndex: number };
export function advanceSimulation(
  state: SimulationState,
  routeKm: number,
  speedKmh: number,
  deltaMinutes: number,
): SimulationState;
