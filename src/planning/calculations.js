// Mars 2000 Sphere: semi-major and semi-minor axes verified in the source USGS Jezero GeoTIFF.
export const MARS_RADIUS_KM = 3396.19;
const radians = (degrees) => (degrees * Math.PI) / 180;
export function validCoordinate(point) {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    point.every(Number.isFinite) &&
    Math.abs(point[0]) <= 180 &&
    Math.abs(point[1]) <= 90
  );
}
export function marsDistanceKm(start, end) {
  if (!validCoordinate(start) || !validCoordinate(end)) throw new Error('Invalid Mars coordinate');
  const latitudeDelta = radians(end[1] - start[1]);
  const longitudeDelta = radians(end[0] - start[0]);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(start[1])) * Math.cos(radians(end[1])) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * MARS_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, haversine)));
}
export function evaluatePlan(points, assumptions) {
  const {
    speedKmh,
    scienceMinutes,
    contingencyMinutes,
    oxygenMinutes,
    batteryMinutes,
    daylightMinutes,
    reservePercent,
    delayPercent,
  } = assumptions;
  const values = Object.values(assumptions);
  if (
    values.some((value) => !Number.isFinite(value)) ||
    speedKmh <= 0 ||
    speedKmh > 20 ||
    scienceMinutes < 0 ||
    contingencyMinutes < 0 ||
    oxygenMinutes <= 0 ||
    batteryMinutes <= 0 ||
    daylightMinutes <= 0 ||
    reservePercent < 0 ||
    reservePercent >= 100 ||
    delayPercent < 0 ||
    delayPercent > 500
  )
    return {
      error: 'Enter valid positive endurance and speed values; reserve must be below 100%.',
    };
  if (points.some((point) => !validCoordinate(point)))
    return { error: 'Coordinates must be valid Mars longitude and latitude.' };
  if (points.length < 2) return { error: 'Set a base and at least one waypoint.' };
  let distanceKm = 0;
  for (let index = 1; index < points.length; index++)
    distanceKm += marsDistanceKm(points[index - 1], points[index]);
  if (distanceKm < 0.001)
    return { error: 'Choose a destination at least one meter from the base.' };
  const outboundMinutes = (distanceKm / speedKmh) * 60 * (1 + delayPercent / 100);
  // Return retraces the full candidate route; there is no invented shortcut to base.
  const returnMinutes = outboundMinutes;
  const plannedMinutes = outboundMinutes + scienceMinutes + returnMinutes + contingencyMinutes;
  const budgets = [
    ['Oxygen', oxygenMinutes],
    ['Battery', batteryMinutes],
    ['Daylight', daylightMinutes],
  ].map(([name, capacityMinutes]) => {
    const reserveMinutes = (capacityMinutes * reservePercent) / 100;
    const usableMinutes = capacityMinutes - reserveMinutes;
    return {
      name,
      capacityMinutes,
      reserveMinutes,
      usableMinutes,
      marginMinutes: usableMinutes - plannedMinutes,
    };
  });
  const limiting = budgets.reduce((current, budget) =>
    budget.usableMinutes < current.usableMinutes ? budget : current,
  );
  return {
    distanceKm,
    roundTripKm: 2 * distanceKm,
    outboundMinutes,
    returnMinutes,
    plannedMinutes,
    budgets,
    limitingResource: limiting.name,
    latestReturnDepartureMinutes: limiting.usableMinutes - returnMinutes - contingencyMinutes,
    marginMinutes: limiting.usableMinutes - plannedMinutes,
    fitsBudget: budgets.every((budget) => budget.marginMinutes >= 0),
  };
}

// Destination on the source reference sphere; bearings are clockwise from north.
export function marsDestination(origin, km, bearingDegrees) {
  const lon = radians(origin[0]),
    lat = radians(origin[1]);
  const bearing = radians(bearingDegrees),
    angle = km / MARS_RADIUS_KM;
  const phi = Math.asin(
    Math.sin(lat) * Math.cos(angle) + Math.cos(lat) * Math.sin(angle) * Math.cos(bearing),
  );
  const lambda =
    lon +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angle) * Math.cos(lat),
      Math.cos(angle) - Math.sin(lat) * Math.sin(phi),
    );
  return [(((lambda * 180) / Math.PI + 540) % 360) - 180, (phi * 180) / Math.PI];
}
// Exact horizontal span on an unrotated longitude/latitude map at the given latitude.
export function marsScalePixels(km, latitude, degreesPerPixel) {
  const ratio = Math.sin(km / (2 * MARS_RADIUS_KM)) / Math.cos(radians(latitude));
  if (!(degreesPerPixel > 0) || Math.abs(ratio) > 1) return null;
  return (2 * Math.asin(ratio) * 180) / Math.PI / degreesPerPixel;
}
