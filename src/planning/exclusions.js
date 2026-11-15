import { marsDistanceKm, validCoordinate, MARS_RADIUS_KM } from './calculations.js';
const radius = MARS_RADIUS_KM * 1000;
const radians = Math.PI / 180;
const wrap = (value) => ((value + 540) % 360) - 180;
export function zoneError(zone) {
  if (!zone || !validCoordinate(zone.center) || Math.abs(zone.center[1]) > 85)
    return 'Enter valid Mars coordinates between 85° S and 85° N.';
  if (!Number.isFinite(zone.radiusMeters) || zone.radiusMeters < 5 || zone.radiusMeters > 2000)
    return 'Radius must be between 5 and 2,000 meters.';
  if (
    typeof zone.title !== 'string' ||
    !zone.title.trim() ||
    zone.title.length > 100 ||
    typeof zone.reason !== 'string' ||
    !zone.reason.trim() ||
    zone.reason.length > 1000
  )
    return 'Give the exclusion a title and a reason.';
  if (zone.source && (typeof zone.source !== 'string' || !/^https:\/\//.test(zone.source)))
    return 'Evidence links must start with https://.';
  return null;
}
function local(point, origin) {
  return [
    wrap(point[0] - origin[0]) * radians * radius * Math.cos(origin[1] * radians),
    (point[1] - origin[1]) * radians * radius,
  ];
}
export function intersectsZone(start, end, zone, padding = 0) {
  const a = local(start, zone.center),
    b = local(end, zone.center),
    dx = b[0] - a[0],
    dy = b[1] - a[1];
  const length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1, -(a[0] * dx + a[1] * dy) / length)) : 0;
  return Math.hypot(a[0] + t * dx, a[1] + t * dy) <= zone.radiusMeters + padding;
}
export function zonePolygon(zone) {
  return Array.from({ length: 65 }, (_, index) => {
    const angle = (index / 64) * 2 * Math.PI;
    return [
      wrap(
        zone.center[0] +
          (Math.cos(angle) * zone.radiusMeters) /
            (radius * radians * Math.cos(zone.center[1] * radians)),
      ),
      zone.center[1] + (Math.sin(angle) * zone.radiusMeters) / (radius * radians),
    ];
  });
}
export function routeConflicts(path, zones) {
  return zones.filter((zone) =>
    path.some((point, index) => intersectsZone(point, path[Math.max(0, index - 1)], zone)),
  );
}
export function manualRoute(points, zones, region) {
  if (zones.some((zone) => zoneError(zone)))
    return { error: 'An exclusion has invalid data. Correct it before planning.' };
  if (points.length < 2 || points.length > 32 || points.some((point) => !validCoordinate(point)))
    return { error: 'Set a base and valid route points (maximum 30 detour waypoints).' };
  if (marsDistanceKm(points[0], points[points.length - 1]) < 0.01)
    return { error: 'Choose a hypothetical base at least 10 meters from the destination.' };
  const conflicts = routeConflicts(points, zones);
  if (conflicts.length)
    return {
      error: `Route intersects: ${conflicts.map((zone) => zone.title).join(', ')}. Move the base or add detour waypoints. No automatic terrain routing is available here.`,
    };
  const path = points.filter(
    (point, index) => index === 0 || marsDistanceKm(points[index - 1], point) > 0.000001,
  );
  let totalKm = 0;
  const cumulativeKm = [0];
  for (let index = 1; index < path.length; index++) {
    totalKm += marsDistanceKm(path[index - 1], path[index]);
    cumulativeKm.push(totalKm);
  }
  if (totalKm < 0.01)
    return { error: 'Choose a hypothetical base at least 10 meters from the destination.' };
  return { path, cumulativeKm, totalKm, cells: [], elevations: [], maxSlopeDegrees: 0 };
}
export function zonesKey(missionId) {
  return `apollos-exclusions-v1-${missionId}`;
}
export function loadZones(storage, missionId) {
  const raw = storage.getItem(zonesKey(missionId));
  if (!raw) return [];
  const zones = JSON.parse(raw);
  if (
    !Array.isArray(zones) ||
    zones.length > 30 ||
    zones.some(
      (zone) => zoneError(zone) || zone.missionId !== missionId || typeof zone.id !== 'string',
    )
  )
    throw new Error(
      'Saved exclusions are unreadable. Existing data has not been overwritten; routing is blocked.',
    );
  return zones;
}
