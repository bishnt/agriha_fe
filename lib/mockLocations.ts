
export interface Location {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  type: string;          // e.g. "neighborhood" | "town" | "municipality"
  description?: string;
  propertyCount?: number;
}

export const mockLocations: Location[] = [
  {
    id: 1,
    name: "Thamel",
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.7154,
    longitude: 85.3123,
    type: "neighborhood",
    description: "Tourist hub with boutique hotels & nightlife",
    propertyCount: 240,
  },
  {
    id: 2,
    name: "Boudha",
    city: "Kathmandu",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.7215,
    longitude: 85.3616,
    type: "neighborhood",
    description: "Peaceful area surrounding Boudhanath Stupa",
    propertyCount: 180,
  },
  {
    id: 3,
    name: "Jhamsikhel",
    city: "Lalitpur",
    state: "Bagmati",
    country: "Nepal",
    latitude: 27.6734,
    longitude: 85.3166,
    type: "neighborhood",
    description: "Café‑packed expat enclave near Patan",
    propertyCount: 95,
  },]