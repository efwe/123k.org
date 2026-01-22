export interface Location {
  location: [number, number]; // lat/lng
}
export interface TrackPoint {
  location: Location;
  time: string;
  elevation?: number;
}

export interface BoundingBox {
  southEast: Location;
  northEast: Location;
  southWest: Location;
  northWest: Location;
}

export interface Track {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  distance: number;
  boundingBox: BoundingBox;
  trackPoints: TrackPoint[];
}
