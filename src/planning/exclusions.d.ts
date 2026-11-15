import type { TerrainRoute } from './navigation.js';
export interface Exclusion {
  id: string;
  missionId: string;
  title: string;
  reason: string;
  center: [number, number];
  radiusMeters: number;
  source: string;
  createdAt: string;
  basis: 'manual';
}
export function zoneError(zone: unknown): string | null;
export function intersectsZone(
  start: [number, number],
  end: [number, number],
  zone: Exclusion,
  padding?: number,
): boolean;
export function zonePolygon(zone: Exclusion): [number, number][];
export function routeConflicts(path: [number, number][], zones: Exclusion[]): Exclusion[];
export function manualRoute(
  points: [number, number][],
  zones: Exclusion[],
  region: [number, number],
): TerrainRoute | { error: string };
export function zonesKey(missionId: string): string;
export function loadZones(storage: Pick<Storage, 'getItem'>, missionId: string): Exclusion[];
