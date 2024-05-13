

export interface IweatherStation {
  id: string;
  name: string;
  shortName: string;
  countryCode: string;
  distance: number;
  geometry: Geometry;
  elementId: string;
}

interface Geometry {
  coordinates: number[];
}