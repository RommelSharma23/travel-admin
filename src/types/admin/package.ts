// types/admin/package.ts

export interface Destination {
  id: number
  name: string
  country: string
  region?: string
  slug?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
  color: string | null
  is_active: boolean
}

export interface PackageImage {
  id?: number
  image_url: string
  image_type: 'hero' | 'gallery' | 'itinerary'
  alt_text: string
  caption: string
  sort_order: number
  day_number?: number
  file?: File
  preview?: string
  uploading?: boolean
}

export interface ItineraryDay {
  day_number: number
  day_title: string
  day_description: string
  activities: string
  images: PackageImage[]
}

export interface PackageFormData {
  title: string
  destination_id: string
  category_id: string
  short_description: string
  long_description: string
  duration_days: number
  duration_nights: number
  max_group_size: string
  min_age: string
  difficulty_level: string
  price_from: string
  price_to: string
  currency: string
  availability_status: string
  is_featured: boolean
  is_best_selling: boolean
  is_active: boolean
  meta_title: string
  meta_description: string
}

export interface PackageData {
  id: number
  reference_no: string
  title: string
  slug: string
  destination_id: number
  category_id: number | null
  short_description: string | null
  long_description: string | null
  duration_days: number
  duration_nights: number | null
  max_group_size: number | null
  min_age: number | null
  difficulty_level: string | null
  price_from: number | null
  price_to: number | null
  currency: string
  availability_status: string
  inclusions: string[]
  exclusions: string[]
  highlights: string[]
  is_featured: boolean
  is_best_selling: boolean
  is_active: boolean
  meta_title: string | null
  meta_description: string | null
  keywords: string[]
  itinerary: ItineraryDay[]
  images: PackageImage[]
  created_at: string
  updated_at: string
  destinations?: Destination
  categories?: Category
}

export interface ValidationErrors {
  [key: string]: string
}

export interface UploadProgress {
  [key: string]: number
}

export interface Tab {
  id: string
  label: string
  icon: string
  description?: string
}

// Constants
export const DIFFICULTY_LEVELS = [
  { value: 'Easy', label: 'Easy - Suitable for all fitness levels' },
  { value: 'Moderate', label: 'Moderate - Basic fitness required' },
  { value: 'Challenging', label: 'Challenging - Good fitness required' },
  { value: 'Expert', label: 'Expert - Excellent fitness required' }
] as const

export const AVAILABILITY_STATUS = [
  { value: 'Available', label: 'Available' },
  { value: 'Limited', label: 'Limited Availability' },
  { value: 'Sold Out', label: 'Sold Out' },
  { value: 'Seasonal', label: 'Seasonal' }
] as const

export const CURRENCIES = [
  { value: 'INR', label: '₹ INR - Indian Rupee' },
  { value: 'USD', label: '$ USD - US Dollar' },
  { value: 'EUR', label: '€ EUR - Euro' },
  { value: 'GBP', label: '£ GBP - British Pound' }
] as const

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]['value']
export type AvailabilityStatus = typeof AVAILABILITY_STATUS[number]['value']
export type Currency = typeof CURRENCIES[number]['value']
export type ImageType = 'hero' | 'gallery' | 'itinerary'

// Form submission types
export interface PackageSubmissionData {
  title: string
  destination_id: number
  category_id: number | null
  short_description: string
  long_description: string
  duration_days: number
  duration_nights: number
  max_group_size: number | null
  min_age: number | null
  difficulty_level: DifficultyLevel
  price_from: number | null
  price_to: number | null
  currency: Currency
  availability_status: AvailabilityStatus
  inclusions: string[]
  exclusions: string[]
  highlights: string[]
  is_featured: boolean
  is_best_selling: boolean
  is_active: boolean
  meta_title: string
  meta_description: string
  keywords: string[]
  itinerary: ItineraryDay[]
  images: PackageImage[]
}