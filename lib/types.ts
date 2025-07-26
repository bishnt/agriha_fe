

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
  ammenities: string[]; // e.g., ["WiFi", "AC", "Parking"] (added)
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
  photos: File[]; // Array of files for multiple images
  amenities: string[];
  photoPreviews?: string[]; // Array of image URLs for previews
}

export type PropertyImagePreview = {
  url: string;
  file: File;
};

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

export type Location = {
  id: string
  name: string
  city: string
  state?: string
  country?: string
  latitude: number
  longitude: number
  description?: string
  propertyCount?: number
  type?: string
}

// Filter related interfaces
export interface FilterCriteria {
  distanceRadius: number;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  minArea: number;
  maxArea: number;
  isAttached: boolean;
  type: string[]; // Array to allow multiple types to be selected
}

// Component props interfaces
export interface HeroSectionProps {
  onSearch?: (query: string) => void;
  onApplyFilters?: (filters: FilterCriteria) => void;
  heroImage?: string;
  title?: string;
  subtitle?: string;
}

export interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterCriteria) => void;
  initialFilters: FilterCriteria;
}

export interface SearchSectionProps {
  onLocationSelect: (location: Location) => void;
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
}
