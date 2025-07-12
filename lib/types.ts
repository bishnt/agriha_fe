

export interface Property {
  id: number;
  title: string; //(added)
  propertyName: string;
  propertyType: string;
  description?: string;
  price: number;
  priceType: string; // e.g., "per month" (added)
  type: string; // e.g., "Room", "Apartment", "House" (added)

  isForRent: boolean;
  isForSale: boolean;
  bedrooms: number;
  bathrooms: number;
  isAttached: boolean; // (added)
  kitchen: number;
  floor: number;
  furnishing?: string;
  area?: number;
  areaUnit?: string; // e.g., "m2", "sqft" (added)
  city: string;
  state: string;
  country: string;
  address: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  isLiked: boolean; // (added)
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  views: number; // (added)
}

export interface PropertyFormData {
  propertyName: string;
  propertyType: string;
  description?: string;
  price: number;
  isForRent: boolean;
  isForSale: boolean;
  bedrooms: number;
  bathrooms: number;
  kitchen: number;
  floor: number;
  furnishing?: string;
  area?: number;
  city: string;
  state: string;
  country: string;
  address: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
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
