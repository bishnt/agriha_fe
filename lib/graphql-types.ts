// GraphQL Types matching backend schema

// Account Types
export interface Account {
  id: number;
  phone: string;
  email: string;
  is_verified: boolean;
  firstname: string;
  lastname: string;
  is_customer: boolean;
  is_superadmin: boolean;
  is_agent: boolean;
  account_created: string;
}

export interface CreateAccountInput {
  phone: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}

export interface UpdateAccountInput {
  phone?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
}

export interface SendOtpInput {
  phone?: string;
  email?: string;
}

export interface VerifyOtpInput {
  phone?: string;
  email?: string;
  otp: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Property Types
export interface Property {
  id: number;
  propertyName: string;
  propertyType: PropertyType;
  description: string;
  price: number;
  isForRent: boolean;
  isForSale: boolean;
  bedrooms: number;
  bathrooms: number;
  kitchen: number;
  floor: number;
  furnishing: string;
  area: number;
  city: string;
  state: string;
  country: string;
  address: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  status: PropertyStatus;
  isActive: boolean;
  isFeatured: boolean;
  accountId: number;
  createdAt: string;
  updatedAt: string;
}

export enum PropertyType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
  VILLA = "VILLA",
  OFFICE = "OFFICE",
  SHOP = "SHOP",
  LAND = "LAND"
}

export enum PropertyStatus {
  AVAILABLE = "AVAILABLE",
  SOLD = "SOLD",
  RENTED = "RENTED",
  PENDING = "PENDING"
}

export interface CreatePropertyInput {
  propertyName: string;
  propertyType: PropertyType;
  description: string;
  price: number;
  isForRent: boolean;
  isForSale: boolean;
  bedrooms: number;
  bathrooms: number;
  kitchen: number;
  floor: number;
  furnishing: string;
  area: number;
  city: string;
  state: string;
  country: string;
  address: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  status: PropertyStatus;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdatePropertyInput {
  id: string;
  propertyName?: string;
  propertyType?: PropertyType;
  description?: string;
  price?: number;
  isForRent?: boolean;
  isForSale?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  kitchen?: number;
  floor?: number;
  furnishing?: string;
  area?: number;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  status?: PropertyStatus;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface PaginationInput {
  limit?: number;
  offset?: number;
}

export interface PaginatedPropertyData {
  items: Property[];
  totalItems: number;
}

// Review Types
export interface Review {
  id: number;
  propertyId: number;
  accountId: number;
  rating: number;
  comment: string;
}

export interface CreateReviewInput {
  propertyId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewInput {
  id: string;
  rating?: number;
  comment?: string;
}

// Response Types
export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse extends BaseResponse {
  accessToken?: string;
  refreshToken?: string;
}

export interface AccountResponse extends BaseResponse {
  account?: Account;
}

export interface AccountsResponse extends BaseResponse {
  accounts?: Account[];
}

export interface PropertyResponse extends BaseResponse {
  data?: Property;
}

export interface PaginatedPropertyResponse extends BaseResponse {
  data?: PaginatedPropertyData;
}

export interface ReviewResponse extends BaseResponse {
  review?: Review;
}

export interface MutationResponse extends BaseResponse {}

// Agent Verification Types
export interface AgentVerification {
  requestId: number;
  phone: string;
  email: string;
  firstname: string;
  lastname: string;
  citizenshipimagefront: string;
  citizenshipimageback: string;
  request_created: string;
}

export interface CreateAgentVerificationInput {
  phone: string;
  email: string;
  firstname: string;
  lastname: string;
  citizenshipimagefront: string;
  citizenshipimageback: string;
}

export interface UpdateAgentVerificationInput {
  requestId: number;
  phone?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  citizenshipimagefront?: string;
  citizenshipimageback?: string;
}
