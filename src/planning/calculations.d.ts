export interface Assumptions {
  speedKmh: number;
  scienceMinutes: number;
  contingencyMinutes: number;
  oxygenMinutes: number;
  batteryMinutes: number;
  daylightMinutes: number;
  reservePercent: number;
  delayPercent: number;
}
export interface Budget {
  name: string;
  capacityMinutes: number;
  reserveMinutes: number;
  usableMinutes: number;
  marginMinutes: number;
}
export type PlanResult =
  | { error: string }
  | {
      distanceKm: number;
      roundTripKm: number;
      outboundMinutes: number;
      returnMinutes: number;
      plannedMinutes: number;
      budgets: Budget[];
      limitingResource: string;
      latestReturnDepartureMinutes: number;
      marginMinutes: number;
      fitsBudget: boolean;
    };
export const MARS_RADIUS_KM: number;
export function validCoordinate(point: unknown): point is [number, number];
export function marsDistanceKm(start: [number, number], end: [number, number]): number;
export function evaluatePlan(points: [number, number][], assumptions: Assumptions): PlanResult;

export function marsDestination(
  origin: [number, number],
  km: number,
  bearingDegrees: number,
): [number, number];
export function marsScalePixels(
  km: number,
  latitude: number,
  degreesPerPixel: number,
): number | null;
