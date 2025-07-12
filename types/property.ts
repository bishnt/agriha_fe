export interface Property {
  id: number;
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
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
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