export interface Property {
  id: string;
  title: string;
  location: string;
  currency: string;
  price: number;
  priceType: string; // e.g., "per month"
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string; // e.g., "m2"
  isAttached: boolean; // for bathroom
  isLiked: boolean;
  type: string; // Add this new property, e.g., "Room", "Apartment", "House"
  createdAt: Date;
  views: number;

}

export interface SearchFilters {
  location?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "USER" | "AGENT" | "ADMIN"
}
