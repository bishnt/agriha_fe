export interface Property {
  id: string
  title: string
  price: number
  currency: string
  priceType: string // "per month", "per year", etc.
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  areaUnit: string
  isAttached: boolean
  imageUrl: string
  description?: string
  amenities?: string[]
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
