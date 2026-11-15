import Feature from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';
import MultiLineString from 'ol/geom/MultiLineString';
import Point from 'ol/geom/Point';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { marsDestination, marsDistanceKm, MARS_RADIUS_KM } from '../planning/calculations.js';

export function createDistanceGuides(origin: [number, number], extent: number[], density: string) {
  const features: Feature<Geometry>[] = [];
  const wrap = (n: number) => ((n + 540) % 360) - 180;
  const [left, bottom, right, top] = extent;
  const corners: [number, number][] = extent.length
    ? [
        [left, bottom],
        [left, top],
        [right, bottom],
        [right, top],
        [(left + right) / 2, (bottom + top) / 2],
      ]
    : [origin];
  const reach = Math.max(
    0.01,
    ...corners.map(([lon, lat]) =>
      marsDistanceKm(origin, [wrap(lon), Math.max(-89.99, Math.min(89.99, lat))]),
    ),
  );
  const targetSpacing = reach / (density === 'fine' ? 12 : 6);
  const power = 10 ** Math.floor(Math.log10(targetSpacing));
  const spacing = [1, 2, 5, 10].find((n) => n * power >= targetSpacing)! * power;

  const count = Math.min(14, Math.ceil(reach / spacing));
  for (let number = 1; number <= count; number++) {
    const km = spacing * number;
    if (km >= Math.PI * MARS_RADIUS_KM) break;
    const points = Array.from({ length: 361 }, (_, index) => marsDestination(origin, km, index));
    // Never draw a line across the map where a ring crosses the longitude seam.
    const segments: number[][][] = [[]];
    for (const point of points) {
      const segment = segments[segments.length - 1];
      if (segment.length && Math.abs(point[0] - segment[segment.length - 1][0]) > 180)
        segments.push([]);
      segments[segments.length - 1].push(point);
    }
    const major = number % 2 === 0;
    const ring = new Feature(new MultiLineString(segments.filter((segment) => segment.length > 1)));
    ring.setStyle([
      new Style({ stroke: new Stroke({ color: 'rgba(12,22,20,0.65)', width: major ? 3 : 2 }) }),
      new Style({
        stroke: new Stroke({
          color: major ? 'rgba(240,237,217,0.85)' : 'rgba(224,232,222,0.5)',
          width: major ? 1.2 : 0.8,
          lineDash: major ? undefined : [3, 7],
        }),
      }),
    ]);
    features.push(ring);
    const text =
      km < 1
        ? `${Number((km * 1000).toPrecision(4))} m`
        : `${Number(km.toPrecision(4)).toLocaleString()} km`;
    // Labels on both sides keep the guide readable when the base is off-center.
    for (const index of [45, 225]) {
      const label = new Feature(new Point(points[index]));
      label.setStyle(
        new Style({
          text: new Text({
            text,
            font: `${major ? 'bold ' : ''}11px Arial`,
            fill: new Fill({ color: '#fff7e9' }),
            backgroundFill: new Fill({ color: 'rgba(16,23,19,0.92)' }),
            padding: [4, 7, 4, 7],
            offsetY: -8,
          }),
        }),
      );
      features.push(label);
    }
  }
  return { features, spacing };
}
