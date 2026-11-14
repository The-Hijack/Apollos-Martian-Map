export interface Mission {
  id: string;
  name: string;
  region: string;
  landingYear: number;
  coordinates: [number, number]; // Mars longitude east, latitude north; degrees.
  description: string;
  topics: string[];
  source: string;
}
export interface Discovery {
  id: string;
  missionId: string;
  title: string;
  observation: string;
  coordinates: [number, number];
  imageUrls: string[];
  createdAt: string;
}
export interface RouteRequest {
  missionId: string;
  start: [number, number];
  destination: [number, number];
  maxSlopeDegrees: number;
}
