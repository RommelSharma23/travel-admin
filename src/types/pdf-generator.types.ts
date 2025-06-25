// src/types/pdf-generator.types.ts
export interface CustomerInfo {
  customerName: string;
  email?: string;
  phone?: string;
  totalTravelers: number;
  travelStartDate?: Date;
  travelEndDate?: Date;
  specialRequirements?: string;
}

export interface TripDetails {
  packageTitle: string;
  destination?: string; // Keep for backward compatibility
  destinationId?: number; // New field for dropdown selection
  duration: string;
  tripDescription?: string;
  maxGroupSize?: number;
  packageHighlights?: string[];
}

export interface PricingInfo {
  totalPackagePrice: number;
  currency: string;
  priceNotes?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  dayTitle: string;
  dayDescription?: string;
}

export interface AdditionalInfo {
  termsConditions?: string;
  additionalNotes?: string;
}

export interface PDFFormData {
  customerInfo: CustomerInfo;
  tripDetails: TripDetails;
  pricing: PricingInfo;
  inclusions?: string[];
  exclusions?: string[];
  itinerary: ItineraryDay[];
  additionalInfo?: AdditionalInfo;
}

// Database types - matching your existing schema
export interface Destination {
  id: number;
  name: string;
  country: string;
  slug: string;
  description?: string;
  long_description?: string;
}

export interface TourPackage {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  long_description?: string;
  duration_days: number;
  duration_nights?: number;
  price_from?: number;
  price_to?: number;
  currency?: string;
  inclusions?: string[];
  exclusions?: string[];
  highlights?: string[];
  max_group_size?: number;
  difficulty_level?: string;
  destination_id?: number;
  category_id?: number;
}

// API Response types
export interface DestinationsResponse {
  destinations: Destination[];
}

export interface PackagesResponse {
  packages: TourPackage[];
}

export interface PackageDetailsResponse {
  package: TourPackage;
  destination: Destination;
  itinerary: ItineraryDay[];
}

// PDF Generation types
export interface PDFGenerationRequest {
  formData: PDFFormData;
  generationType: 'scratch' | 'prepopulated';
  destinationId?: number;
  packageId?: number;
}

export interface PDFGenerationResponse {
  success: boolean;
  filename: string;
  downloadUrl: string;
  fileSize: number;
  auditId: number;
}