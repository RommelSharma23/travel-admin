// src/app/dashboard/packages/edit/[id]/page.tsx - FILE 1 OF 5
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

import { testUploadFunction } from '@/lib/image-upload'
// Supabase Integration
import { supabase } from '@/lib/supabase'
import { validateImageFile } from '@/lib/image-upload'

const SUPABASE_BUCKET = 'getaway-vibe'

// Icons
const PhotoIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>📷</div>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>➕</div>
)

const MinusIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>➖</div>
)

const TrashIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>🗑️</div>
)

const EditIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>✏️</div>
)

// Upload Functions
interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

// TEST COMPONENT
function TestUploadButton() {
  const handleTestUpload = () => {
    const testBlob = new Blob(['test'], { type: 'image/png' })
    const testFile = new File([testBlob], 'test.png', { type: 'image/png' })
    
    console.log('🚀 Starting test upload...')
    testUploadFunction(testFile)
  }

  return (
    <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🧪 Debug Test</h3>
      <p className="text-yellow-700 text-sm mb-3">
        Click to test upload function and check console logs
      </p>
      <button 
        onClick={handleTestUpload}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        type="button"
      >
        🧪 Test Upload Function
      </button>
    </div>
  )
}

async function uploadPackageImage(
  file: File, 
  packageTitle: string, 
  imageType: 'hero' | 'gallery' | 'itinerary',
  dayNumber?: number
): Promise<UploadResult> {
  try {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 6)
    
    const cleanTitle = packageTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 30)

    let filePath = ''
    if (imageType === 'hero') {
      filePath = `packages/${cleanTitle}/hero/${cleanTitle}-hero-${timestamp}.${fileExt}`
    } else if (imageType === 'gallery') {
      filePath = `packages/${cleanTitle}/gallery/${cleanTitle}-gallery-${randomId}-${timestamp}.${fileExt}`
    } else if (imageType === 'itinerary' && dayNumber) {
      filePath = `packages/${cleanTitle}/itinerary/day-${dayNumber}/${cleanTitle}-day${dayNumber}-${randomId}-${timestamp}.${fileExt}`
    }

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      if (error.message.includes('Bucket not found')) {
        return { success: false, error: 'Storage bucket not configured. Please contact admin.' }
      } else if (error.message.includes('already exists')) {
        return { success: false, error: 'Image with this name already exists. Please try again.' }
      } else {
        return { success: false, error: `Upload failed: ${error.message}` }
      }
    }

    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }

  } catch (error) {
    return { 
      success: false, 
      error: `Network error: ${error instanceof Error ? error.message : 'Please check your connection'}` 
    }
  }
}

async function deletePackageImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = new URL(imageUrl)
    const pathSegments = url.pathname.split('/')
    const bucketIndex = pathSegments.findIndex(segment => segment === 'package-images')
    
    if (bucketIndex === -1) {
      return { success: false, error: 'Invalid image URL format' }
    }

    const filePath = pathSegments.slice(bucketIndex + 1).join('/')
    
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove([filePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error) {
    return { 
      success: false, 
      error: `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Types
interface PageProps {
  params: { id: string }
}

interface Destination {
  id: number
  name: string
  country: string
}

interface Category {
  id: number
  name: string
  icon: string | null
  color: string | null
  is_active: boolean
}

interface ItineraryDay {
  day_number: number
  day_title: string
  day_description: string
  activities: string
  images: PackageImage[]
}

interface PackageImage {
  id?: number
  image_url: string
  image_type: 'hero' | 'gallery' | 'itinerary'
  alt_text: string
  caption: string
  sort_order: number
  day_number?: number
}

interface PackageData {
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

interface ValidationErrors {
  [key: string]: string
}

// Constants
const DIFFICULTY_LEVELS = [
  { value: 'Easy', label: 'Easy - Suitable for all fitness levels' },
  { value: 'Moderate', label: 'Moderate - Basic fitness required' },
  { value: 'Challenging', label: 'Challenging - Good fitness required' },
  { value: 'Expert', label: 'Expert - Excellent fitness required' }
]

const AVAILABILITY_STATUS = [
  { value: 'Available', label: 'Available' },
  { value: 'Limited', label: 'Limited Availability' },
  { value: 'Sold Out', label: 'Sold Out' },
  { value: 'Seasonal', label: 'Seasonal' }
]

const CURRENCIES = [
  { value: 'INR', label: '₹ INR - Indian Rupee' },
  { value: 'USD', label: '$ USD - US Dollar' },
  { value: 'EUR', label: '€ EUR - Euro' },
  { value: 'GBP', label: '£ GBP - British Pound' }
]

const getCurrencySymbol = (currency: string) => {
  const symbols: { [key: string]: string } = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  }
  return symbols[currency] || '₹'
}


// src/app/dashboard/packages/edit/[id]/page.tsx - FILE 2 OF 5: FIXED PackageImageUpload Component

// FIXED Image Upload Component
interface PackageImageUploadProps {
  imageType: 'hero' | 'gallery' | 'itinerary'
  currentImage?: PackageImage
  onImageUploaded: (imageData: Partial<PackageImage>) => void
  onImageRemoved: () => void
  dayNumber?: number
  packageTitle: string
}

function PackageImageUpload({ 
  imageType, 
  currentImage, 
  onImageUploaded, 
  onImageRemoved,
  dayNumber,
  packageTitle 
}: PackageImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage?.image_url || null)
  const [showMetaForm, setShowMetaForm] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [hasUploaded, setHasUploaded] = useState(false)

 const [uploadInProgress, setUploadInProgress] = useState(false) // ✅ NEW: Additional guard
  const [metaData, setMetaData] = useState({
    alt_text: currentImage?.alt_text || '',
    caption: currentImage?.caption || ''
  })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('🚀 Starting file upload for:', file.name)
    
    // ✅ FIXED: PREVENT DUPLICATE UPLOADS
    if (uploading || hasUploaded) {
      console.log('⚠️ Upload already in progress or completed, skipping')
      return
    }

    setUploadError(null)
    setUploadProgress(0)
    setHasUploaded(false) // ✅ FIXED: Reset for new upload

    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    setUploading(true)
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      console.log('📤 Uploading to Supabase...')
      const result = await uploadPackageImage(file, packageTitle, imageType, dayNumber)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (result.success && result.url) {
        console.log('✅ Upload successful:', result.url)
        
        const imageData: Partial<PackageImage> = {
          image_url: result.url,
          image_type: imageType,
          alt_text: metaData.alt_text || `${packageTitle} ${imageType} image`,
          caption: metaData.caption || '',
          sort_order: 0,
          day_number: dayNumber
        }
        
        // ✅ FIXED: ONLY CALL ONCE AND MARK AS UPLOADED
        if (!hasUploaded) {
          console.log('📋 Calling onImageUploaded with:', imageData)
          onImageUploaded(imageData)
          setHasUploaded(true) // ✅ FIXED: Mark as uploaded
        }
        
        setPreviewUrl(result.url)
        setShowMetaForm(true)
        
        URL.revokeObjectURL(preview)
        
        // ✅ FIXED: RESET FILE INPUT TO ALLOW NEW UPLOADS
        event.target.value = ''
        
      } else {
        console.error('❌ Upload failed:', result.error)
        setUploadError(result.error || 'Upload failed')
        setPreviewUrl(currentImage?.image_url || null)
        setHasUploaded(false) // ✅ FIXED: Reset on failure
      }
      
    } catch (error) {
      console.error('❌ Network error:', error)
      setUploadError('Network error during upload')
      setPreviewUrl(currentImage?.image_url || null)
      setHasUploaded(false) // ✅ FIXED: Reset on error
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const handleRemoveImage = async () => {
    console.log('🗑️ Removing image...')
    
    if (currentImage?.image_url) {
      setUploading(true)
      try {
        const result = await deletePackageImage(currentImage.image_url)
        if (!result.success) {
          console.warn('Failed to delete from storage:', result.error)
        }
      } catch (error) {
        console.warn('Error deleting image:', error)
      } finally {
        setUploading(false)
      }
    }

    // ✅ FIXED: RESET ALL STATES INCLUDING UPLOAD STATUS
    setPreviewUrl(null)
    setMetaData({ alt_text: '', caption: '' })
    setShowMetaForm(false)
    setUploadError(null)
    setHasUploaded(false) // ✅ FIXED: Reset upload status
    onImageRemoved()
  }

  const handleMetaUpdate = () => {
    if (currentImage) {
      onImageUploaded({
        ...currentImage,
        alt_text: metaData.alt_text,
        caption: metaData.caption
      })
    }
    setShowMetaForm(false)
  }

  // ✅ FIXED: RESET UPLOAD STATUS WHEN SWITCHING BETWEEN DIFFERENT UPLOADS
  useEffect(() => {
    if (!previewUrl && !currentImage?.image_url) {
      setHasUploaded(false)
    }
  }, [previewUrl, currentImage])

  return (
    <div className="space-y-3">
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">❌</span>
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        </div>
      )}

      {previewUrl ? (
        <div className="relative group">
          <div className={`${imageType === 'hero' ? 'aspect-video' : 'aspect-square'} bg-gray-200 rounded-lg overflow-hidden`}>
            <img
              src={previewUrl}
              alt={metaData.alt_text || 'Package image'}
              className="w-full h-full object-cover"
            />
            
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm font-medium">Uploading to Supabase...</p>
                  {uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="bg-white/20 rounded-full h-2 w-32 mx-auto">
                        <div 
                          className="bg-white rounded-full h-2 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {!uploading && (
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowMetaForm(!showMetaForm)}
                className="bg-white/90 hover:bg-white h-8 w-8 p-0"
              >
                <EditIcon className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemoveImage}
                className="bg-white/90 hover:bg-red-50 text-red-600 h-8 w-8 p-0"
              >
                <TrashIcon className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={`${imageType === 'hero' ? 'aspect-video' : 'aspect-square'} bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors`}>
          <label className="cursor-pointer text-center p-4 w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
             disabled={uploading || hasUploaded || uploadInProgress} // ✅ ENHANCED: All guards
            />
            <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              {uploading ? 'Uploading...' : hasUploaded ? 'Upload Complete' : `Upload ${imageType === 'hero' ? 'Hero' : imageType === 'gallery' ? 'Gallery' : 'Day'} Image`}
            </p>
            <p className="text-xs text-gray-500">
              {imageType === 'hero' ? '1200x800px recommended' : '800x800px recommended'}
            </p>
          </label>
        </div>
      )}

      {showMetaForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <h4 className="font-medium text-sm text-gray-900">Image Details</h4>
          
          <div className="space-y-2">
            <Label className="text-xs">Alt Text (for accessibility)</Label>
            <Input
              value={metaData.alt_text}
              onChange={(e) => setMetaData(prev => ({ ...prev, alt_text: e.target.value }))}
              placeholder="Describe this image..."
              className="text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Caption (optional)</Label>
            <Input
              value={metaData.caption}
              onChange={(e) => setMetaData(prev => ({ ...prev, caption: e.target.value }))}
              placeholder="Image caption..."
              className="text-sm"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              size="sm"
              onClick={handleMetaUpdate}
              className="flex-1"
            >
              Save Details
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowMetaForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {previewUrl && !showMetaForm && (metaData.alt_text || metaData.caption) && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          {metaData.alt_text && <p><strong>Alt:</strong> {metaData.alt_text}</p>}
          {metaData.caption && <p><strong>Caption:</strong> {metaData.caption}</p>}
        </div>
      )}
    </div>
  )
}

// src/app/dashboard/packages/edit/[id]/page.tsx - FILE 3 OF 5: Main Component State and Handlers

export default function EditPackagePage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [activeTab, setActiveTab] = useState('basic')
  const [successMessage, setSuccessMessage] = useState('')
  
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    destination_id: '',
    category_id: '',
    short_description: '',
    long_description: '',
    duration_days: 1,
    duration_nights: 0,
    max_group_size: '',
    min_age: '',
    difficulty_level: 'Easy',
    price_from: '',
    price_to: '',
    currency: 'INR',
    availability_status: 'Available',
    is_featured: false,
    is_best_selling: false,
    is_active: true,
    meta_title: '',
    meta_description: ''
  })

  const [inclusions, setInclusions] = useState<string[]>([''])
  const [exclusions, setExclusions] = useState<string[]>([''])
  const [highlights, setHighlights] = useState<string[]>([''])
  const [keywords, setKeywords] = useState<string[]>([''])
   const uploadLockRef = useRef<Set<string>>(new Set())
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([{
    day_number: 1,
    day_title: '',
    day_description: '',
    activities: '',
    images: []
  }])

  const [packageImages, setPackageImages] = useState<PackageImage[]>([])

  useEffect(() => {
    fetchPackageData()
    fetchDestinations()
    fetchCategories()
  }, [params.id])

  const fetchPackageData = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/packages/${params.id}`)
      const data = await response.json()

      if (response.ok && data.package) {
        const pkg = data.package
        setPackageData(pkg)
        
        setFormData({
          title: pkg.title || '',
          destination_id: pkg.destination_id?.toString() || '',
          category_id: pkg.category_id?.toString() || '',
          short_description: pkg.short_description || '',
          long_description: pkg.long_description || '',
          duration_days: pkg.duration_days || 1,
          duration_nights: pkg.duration_nights || 0,
          max_group_size: pkg.max_group_size?.toString() || '',
          min_age: pkg.min_age?.toString() || '',
          difficulty_level: pkg.difficulty_level || 'Easy',
          price_from: pkg.price_from?.toString() || '',
          price_to: pkg.price_to?.toString() || '',
          currency: pkg.currency || 'INR',
          availability_status: pkg.availability_status || 'Available',
          is_featured: pkg.is_featured || false,
          is_best_selling: pkg.is_best_selling || false,
          is_active: pkg.is_active !== false,
          meta_title: pkg.meta_title || '',
          meta_description: pkg.meta_description || ''
        })

        setInclusions(pkg.inclusions && pkg.inclusions.length > 0 ? pkg.inclusions : [''])
        setExclusions(pkg.exclusions && pkg.exclusions.length > 0 ? pkg.exclusions : [''])
        setHighlights(pkg.highlights && pkg.highlights.length > 0 ? pkg.highlights : [''])
        setKeywords(pkg.keywords && pkg.keywords.length > 0 ? pkg.keywords : [''])

        if (pkg.itinerary && pkg.itinerary.length > 0) {
          setItinerary(pkg.itinerary)
        }

        if (pkg.images && pkg.images.length > 0) {
          setPackageImages(pkg.images)
        }

      } else {
        setError(data.error || 'Failed to fetch package data')
      }
    } catch (error) {
      setError('Network error while fetching package data')
      console.error('Error fetching package:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchDestinations = async () => {
    try {
      const response = await fetch('/api/destinations')
      const data = await response.json()
      if (response.ok) {
        setDestinations(data.destinations || [])
      }
    } catch (error) {
      console.error('Error fetching destinations:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Image Management Functions
  const handleHeroImageUpdate = (imageData: Partial<PackageImage>) => {
    setPackageImages(prev => {
      const filtered = prev.filter(img => img.image_type !== 'hero')
      return [...filtered, { ...imageData, image_type: 'hero', sort_order: 0 } as PackageImage]
    })
  }

  const handleHeroImageRemove = () => {
    setPackageImages(prev => prev.filter(img => img.image_type !== 'hero'))
  }

  const handleGalleryImageAdd = (imageData: Partial<PackageImage>) => {
    const newSortOrder = packageImages.filter(img => img.image_type === 'gallery').length
    setPackageImages(prev => [
      ...prev,
      { ...imageData, image_type: 'gallery', sort_order: newSortOrder } as PackageImage
    ])
  }

  const handleGalleryImageRemove = (index: number) => {
    setPackageImages(prev => {
      const galleryImages = prev.filter(img => img.image_type === 'gallery')
      const otherImages = prev.filter(img => img.image_type !== 'gallery')
      galleryImages.splice(index, 1)
      const reIndexedGallery = galleryImages.map((img, i) => ({ ...img, sort_order: i }))
      return [...otherImages, ...reIndexedGallery]
    })
  }

  // ✅ FIXED: handleItineraryImageAdd with duplicate prevention
const handleItineraryImageAdd = (dayNumber: number, imageData: Partial<PackageImage>) => {
  console.log('🔍 DEBUG: handleItineraryImageAdd called for day', dayNumber)
  
  setItinerary(prev => prev.map(day => 
    day.day_number === dayNumber
      ? { 
          ...day, 
          images: [{ ...imageData, image_type: 'itinerary', day_number: dayNumber } as PackageImage] // ✅ Replace instead of append
        }
      : day
  ))
}


const handleItineraryImageRemove = (dayNumber: number, imageIndex: number) => {
  setItinerary(prev => prev.map(day => 
    day.day_number === dayNumber
      ? { 
          ...day, 
          images: [] // ✅ Clear all images (since we only have 1)
        }
      : day
  ))
}

  // Form Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }))
  }

  const addArrayItem = (arrayName: 'inclusions' | 'exclusions' | 'highlights' | 'keywords') => {
    const setters = {
      inclusions: setInclusions,
      exclusions: setExclusions,
      highlights: setHighlights,
      keywords: setKeywords
    }
    setters[arrayName](prev => [...prev, ''])
  }

  const removeArrayItem = (arrayName: 'inclusions' | 'exclusions' | 'highlights' | 'keywords', index: number) => {
    const setters = {
      inclusions: setInclusions,
      exclusions: setExclusions,
      highlights: setHighlights,
      keywords: setKeywords
    }
    setters[arrayName](prev => prev.filter((_, i) => i !== index))
  }

  const updateArrayItem = (arrayName: 'inclusions' | 'exclusions' | 'highlights' | 'keywords', index: number, value: string) => {
    const setters = {
      inclusions: setInclusions,
      exclusions: setExclusions,
      highlights: setHighlights,
      keywords: setKeywords
    }
    setters[arrayName](prev => prev.map((item, i) => i === index ? value : item))
  }

  const addItineraryDay = () => {
    const newDayNumber = itinerary.length + 1
    setItinerary(prev => [...prev, {
      day_number: newDayNumber,
      day_title: '',
      day_description: '',
      activities: '',
      images: []
    }])
  }

  const removeItineraryDay = (index: number) => {
    if (itinerary.length <= 1) return
    
    setItinerary(prev => {
      const updated = prev.filter((_, i) => i !== index)
      return updated.map((day, i) => ({
        ...day,
        day_number: i + 1
      }))
    })
  }

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: any) => {
    setItinerary(prev => prev.map((day, i) => 
      i === index ? { ...day, [field]: value } : day
    ))
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Package title is required'
    }
    
    if (!formData.destination_id) {
      errors.destination_id = 'Destination is required'
    }
    
    if (formData.duration_days < 1) {
      errors.duration_days = 'Duration must be at least 1 day'
    }
    
    if (formData.duration_nights < 0) {
      errors.duration_nights = 'Nights cannot be negative'
    }
    
    if (formData.price_from && formData.price_to) {
      const priceFrom = parseFloat(formData.price_from)
      const priceTo = parseFloat(formData.price_to)
      
      if (priceFrom >= priceTo) {
        errors.price_to = 'Price To must be greater than Price From'
      }
    }
    
    if (formData.max_group_size && parseInt(formData.max_group_size) < 1) {
      errors.max_group_size = 'Group size must be at least 1'
    }
    
    if (formData.min_age && parseInt(formData.min_age) < 0) {
      errors.min_age = 'Minimum age cannot be negative'
    }
    
    itinerary.forEach((day, index) => {
      if (!day.day_title.trim()) {
        errors[`itinerary_${index}_title`] = `Day ${index + 1} title is required`
      }
    })
    
    const validHighlights = highlights.filter(item => item.trim())
    if (validHighlights.length === 0) {
      errors.highlights = 'At least one highlight is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError('Please fix the validation errors below')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      const allImages = [
        ...packageImages,
        ...itinerary.flatMap(day => day.images)
      ]

      const submissionData = {
        ...formData,
        destination_id: parseInt(formData.destination_id),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        duration_days: parseInt(formData.duration_days.toString()),
        duration_nights: parseInt(formData.duration_nights.toString()),
        max_group_size: formData.max_group_size ? parseInt(formData.max_group_size) : null,
        min_age: formData.min_age ? parseInt(formData.min_age) : null,
        price_from: formData.price_from ? parseFloat(formData.price_from) : null,
        price_to: formData.price_to ? parseFloat(formData.price_to) : null,
        inclusions: inclusions.filter(item => item.trim()),
        exclusions: exclusions.filter(item => item.trim()),
        highlights: highlights.filter(item => item.trim()),
        keywords: keywords.filter(item => item.trim()),
        itinerary: itinerary.map(day => ({
          ...day,
          images: day.images || []
        })),
        images: allImages
      }
      
      const response = await fetch(`/api/packages/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccessMessage('Package updated successfully!')
        await fetchPackageData()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError(data.error || 'Failed to update package')
      }
      
    } catch (error) {
      setError('Network error while updating package')
      console.error('Error updating package:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  useEffect(() => {
    if (formData.title) {
      if (!formData.meta_title) {
        setFormData(prev => ({ ...prev, meta_title: formData.title }))
      }
    }
  }, [formData.title])

  // Array Manager Component
  const ArrayManager = ({ 
    title, 
    items, 
    arrayName, 
    placeholder, 
    error 
  }: { 
    title: string
    items: string[]
    arrayName: 'inclusions' | 'exclusions' | 'highlights' | 'keywords'
    placeholder: string
    error?: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{title}</Label>
        <Button
          type="button"
          onClick={() => addArrayItem(arrayName)}
          size="sm"
          variant="outline"
          className="h-8 px-3"
        >
          <PlusIcon className="w-3 h-3 mr-1" />
          Add {title.slice(0, -1)}
        </Button>
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateArrayItem(arrayName, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => removeArrayItem(arrayName, index)}
              size="sm"
              variant="outline"
              className="h-10 px-3 text-red-600 hover:bg-red-50"
              disabled={items.length === 1}
            >
              <MinusIcon className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )

  // Helper functions for render logic
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'itinerary', label: 'Itinerary', icon: '🗓️' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'seo', label: 'SEO', icon: '🔍' }
  ]

  const getTabValidation = (tabId: string) => {
    const tabErrors = Object.keys(validationErrors).filter(key => {
      switch (tabId) {
        case 'basic':
          return ['title', 'destination_id', 'short_description', 'long_description'].includes(key)
        case 'details':
          return ['max_group_size', 'min_age', 'highlights'].includes(key)
        case 'pricing':
          return ['price_from', 'price_to'].includes(key)
        case 'itinerary':
          return key.startsWith('itinerary_')
        case 'seo':
          return ['meta_title', 'meta_description'].includes(key)
        default:
          return false
      }
    })
    return tabErrors.length > 0
  }

  // Get current images by type
  const heroImage = packageImages.find(img => img.image_type === 'hero')
  const galleryImages = packageImages.filter(img => img.image_type === 'gallery').sort((a, b) => a.sort_order - b.sort_order)
  
  
  // src/app/dashboard/packages/edit/[id]/page.tsx - FILE 4 OF 5: Loading States, Header, Messages, Tabs, Basic Info, Details

  // Loading states
  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Edit Package</h1>
          <Link href="/dashboard/packages">
            <Button variant="outline">← Back to Packages</Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package data...</p>
        </div>
      </div>
    )
  }

  if (error && !packageData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Edit Package</h1>
          <Link href="/dashboard/packages">
            <Button variant="outline">← Back to Packages</Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Package Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/dashboard/packages">
            <Button>Back to Packages</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Package</h1>
          <p className="text-gray-600 mt-2">
            {packageData ? `Editing: ${packageData.title}` : 'Update package information'}
          </p>
          {packageData && (
            <div className="flex items-center space-x-4 mt-3">
              <Badge variant="outline">{packageData.reference_no}</Badge>
              <Badge variant={packageData.is_active ? 'success' : 'secondary'}>
                {packageData.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {packageData.is_featured && <Badge variant="warning">Featured</Badge>}
              {packageData.is_best_selling && <Badge variant="success">Best Selling</Badge>}
            </div>
          )}
        </div>
        <Link href="/dashboard/packages">
          <Button variant="outline">← Back to Packages</Button>
        </Link>
      </div>

      <TestUploadButton />

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="text-green-400 text-xl mr-3">✅</div>
            <div>
              <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Progress Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {getTabValidation(tab.id) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        {/* TAB 1: BASIC INFO */}
        {activeTab === 'basic' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📝</span>
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>Essential package details and descriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Package Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Package Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. 7-Day Golden Triangle Tour"
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-600">{validationErrors.title}</p>
                )}
                <p className="text-xs text-gray-500">
                  Slug: {generateSlug(formData.title)}
                </p>
              </div>

              {/* Destination & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <select
                    id="destination"
                    value={formData.destination_id}
                    onChange={(e) => handleInputChange('destination_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${validationErrors.destination_id ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Destination</option>
                    {destinations.map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name}, {dest.country}
                      </option>
                    ))}
                  </select>
                  {validationErrors.destination_id && (
                    <p className="text-sm text-red-600">{validationErrors.destination_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category/Theme</Label>
                  <select
                    id="category"
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(cat => cat.is_active).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration_days">Duration (Days) *</Label>
                  <Input
                    id="duration_days"
                    type="number"
                    min="1"
                    value={formData.duration_days}
                    onChange={(e) => handleInputChange('duration_days', parseInt(e.target.value) || 1)}
                    className={validationErrors.duration_days ? 'border-red-500' : ''}
                  />
                  {validationErrors.duration_days && (
                    <p className="text-sm text-red-600">{validationErrors.duration_days}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_nights">Duration (Nights)</Label>
                  <Input
                    id="duration_nights"
                    type="number"
                    min="0"
                    value={formData.duration_nights}
                    onChange={(e) => handleInputChange('duration_nights', parseInt(e.target.value) || 0)}
                    className={validationErrors.duration_nights ? 'border-red-500' : ''}
                  />
                  {validationErrors.duration_nights && (
                    <p className="text-sm text-red-600">{validationErrors.duration_nights}</p>
                  )}
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  placeholder="Brief package summary (1-2 sentences)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                />
                <p className="text-xs text-gray-500">
                  {formData.short_description.length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="long_description">Detailed Description</Label>
                <textarea
                  id="long_description"
                  value={formData.long_description}
                  onChange={(e) => handleInputChange('long_description', e.target.value)}
                  placeholder="Comprehensive package description with highlights and experiences"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                />
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={() => handleCheckboxChange('is_active')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="is_active">Active Package</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={() => handleCheckboxChange('is_featured')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="is_featured">Featured Package</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_best_selling"
                    checked={formData.is_best_selling}
                    onChange={() => handleCheckboxChange('is_best_selling')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="is_best_selling">Best Selling</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: DETAILS */}
        {activeTab === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📋</span>
                <span>Package Details</span>
              </CardTitle>
              <CardDescription>Group size, age requirements, and package features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Group Size & Age */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max_group_size">Max Group Size</Label>
                  <Input
                    id="max_group_size"
                    type="number"
                    min="1"
                    value={formData.max_group_size}
                    onChange={(e) => handleInputChange('max_group_size', e.target.value)}
                    placeholder="e.g. 12"
                    className={validationErrors.max_group_size ? 'border-red-500' : ''}
                  />
                  {validationErrors.max_group_size && (
                    <p className="text-sm text-red-600">{validationErrors.max_group_size}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_age">Minimum Age</Label>
                  <Input
                    id="min_age"
                    type="number"
                    min="0"
                    value={formData.min_age}
                    onChange={(e) => handleInputChange('min_age', e.target.value)}
                    placeholder="e.g. 18"
                    className={validationErrors.min_age ? 'border-red-500' : ''}
                  />
                  {validationErrors.min_age && (
                    <p className="text-sm text-red-600">{validationErrors.min_age}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty_level">Difficulty Level</Label>
                  <select
                    id="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Availability Status */}
              <div className="space-y-2">
                <Label htmlFor="availability_status">Availability Status</Label>
                <select
                  id="availability_status"
                  value={formData.availability_status}
                  onChange={(e) => handleInputChange('availability_status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md md:w-1/3"
                >
                  {AVAILABILITY_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Package Arrays */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ArrayManager
                  title="Inclusions"
                  items={inclusions}
                  arrayName="inclusions"
                  placeholder="e.g. All meals included"
                />

                <ArrayManager
                  title="Exclusions"
                  items={exclusions}
                  arrayName="exclusions"
                  placeholder="e.g. International flights"
                />
              </div>

              <ArrayManager
                title="Highlights"
                items={highlights}
                arrayName="highlights"
                placeholder="e.g. Visit to Taj Mahal at sunrise"
                error={validationErrors.highlights}
              />
            </CardContent>
          </Card>
        )}
		
		
		
		// src/app/dashboard/packages/edit/[id]/page.tsx - FILE 5 OF 6: Pricing, Itinerary, and Images Tabs

        {/* TAB 3: PRICING */}
        {activeTab === 'pricing' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>💰</span>
                <span>Pricing Information</span>
              </CardTitle>
              <CardDescription>Package pricing and currency settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md md:w-1/3"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.value} value={curr.value}>
                      {curr.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price_from">Price From</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {getCurrencySymbol(formData.currency)}
                    </span>
                    <Input
                      id="price_from"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_from}
                      onChange={(e) => handleInputChange('price_from', e.target.value)}
                      placeholder="0.00"
                      className={`pl-8 ${validationErrors.price_from ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {validationErrors.price_from && (
                    <p className="text-sm text-red-600">{validationErrors.price_from}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_to">Price To</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {getCurrencySymbol(formData.currency)}
                    </span>
                    <Input
                      id="price_to"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_to}
                      onChange={(e) => handleInputChange('price_to', e.target.value)}
                      placeholder="0.00"
                      className={`pl-8 ${validationErrors.price_to ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {validationErrors.price_to && (
                    <p className="text-sm text-red-600">{validationErrors.price_to}</p>
                  )}
                </div>
              </div>

              {/* Price Preview */}
              {(formData.price_from || formData.price_to) && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Price Preview</h4>
                  <p className="text-blue-800">
                    {formData.price_from && formData.price_to ? (
                      `${getCurrencySymbol(formData.currency)}${formData.price_from} - ${getCurrencySymbol(formData.currency)}${formData.price_to}`
                    ) : formData.price_from ? (
                      `Starting from ${getCurrencySymbol(formData.currency)}${formData.price_from}`
                    ) : (
                      `Up to ${getCurrencySymbol(formData.currency)}${formData.price_to}`
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 4: ITINERARY */}
        {activeTab === 'itinerary' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🗓️</span>
                <span>Itinerary Planning</span>
              </CardTitle>
              <CardDescription>Day-by-day tour schedule with Supabase image uploads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {itinerary.map((day, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">
                      Day {day.day_number}
                    </h4>
                    <div className="flex space-x-2">
                      {itinerary.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeItineraryDay(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <MinusIcon className="w-4 h-4 mr-1" />
                          Remove Day
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Day Content - Left 2/3 */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`day_title_${index}`}>Day Title *</Label>
                        <Input
                          id={`day_title_${index}`}
                          value={day.day_title}
                          onChange={(e) => updateItineraryDay(index, 'day_title', e.target.value)}
                          placeholder="e.g. Arrival in Delhi - City Orientation"
                          className={validationErrors[`itinerary_${index}_title`] ? 'border-red-500' : ''}
                        />
                        {validationErrors[`itinerary_${index}_title`] && (
                          <p className="text-sm text-red-600">{validationErrors[`itinerary_${index}_title`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`day_description_${index}`}>Day Description</Label>
                        <textarea
                          id={`day_description_${index}`}
                          value={day.day_description}
                          onChange={(e) => updateItineraryDay(index, 'day_description', e.target.value)}
                          placeholder="Overview of the day's experience"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`activities_${index}`}>Activities</Label>
                        <textarea
                          id={`activities_${index}`}
                          value={day.activities}
                          onChange={(e) => updateItineraryDay(index, 'activities', e.target.value)}
                          placeholder="Detailed list of activities and experiences"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                        />
                      </div>
                    </div>

               {/* Day Images - Right 1/3 */}
<div className="space-y-4">
  <Label className="text-sm font-medium">Day {day.day_number} Image</Label>
  
  {/* Show existing image OR upload component */}
  {day.images && day.images.length > 0 ? (
    <div className="space-y-3">
      <div className="relative group">
        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
          <img
            src={day.images[0].image_url}
            alt={day.images[0].alt_text || `Day ${day.day_number} image`}
            className="w-full h-full object-cover"
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => handleItineraryImageRemove(day.day_number, 0)}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        >
          <TrashIcon className="w-3 h-3" />
        </Button>
        {day.images[0].caption && (
          <p className="text-xs text-gray-600 mt-1 px-1">{day.images[0].caption}</p>
        )}
      </div>
      
      {/* Replace Image Button */}
      <div className="text-center">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleItineraryImageRemove(day.day_number, 0)}
          className="text-blue-600 hover:bg-blue-50"
        >
          🔄 Replace Image
        </Button>
      </div>
    </div>
  ) : (
    /* Upload new image when no image exists */
    <PackageImageUpload
      imageType="itinerary"
      dayNumber={day.day_number}
      packageTitle={formData.title}
      onImageUploaded={(imageData) => handleItineraryImageAdd(day.day_number, imageData)}
      onImageRemoved={() => {}}
    />
  )}
  
  <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
    <p className="text-xs text-blue-800">
      💡 <strong>One image per day:</strong> Upload a representative image for this day's activities.
    </p>
  </div>
</div>
                  </div>
                </div>
              )
              )}

              <div className="text-center">
                <Button
                  type="button"
                  onClick={addItineraryDay}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Another Day
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5: IMAGES */}
        {activeTab === 'images' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🖼️</span>
                <span>Package Images</span>
              </CardTitle>
              <CardDescription>Hero image and gallery management with Supabase Storage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Hero Image Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Hero Image</Label>
                  {heroImage && (
                    <Badge variant="success">✅ Hero Set</Badge>
                  )}
                </div>
                
                <div className="max-w-2xl">
                  <PackageImageUpload
                    imageType="hero"
                    currentImage={heroImage}
                    packageTitle={formData.title}
                    onImageUploaded={handleHeroImageUpdate}
                    onImageRemoved={handleHeroImageRemove}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Hero Image:</strong> Main package image displayed on listing pages. 
                    Recommended size: 1200x800px for best quality.
                  </p>
                </div>
              </div>

              {/* Gallery Images Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Gallery Images</Label>
                  <Badge variant="outline">
                    {galleryImages.length} {galleryImages.length === 1 ? 'Image' : 'Images'}
                  </Badge>
                </div>

                {/* Existing Gallery Images */}
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={img.image_url}
                            alt={img.alt_text || `Gallery image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleGalleryImageRemove(index)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                            #{index + 1}
                            {img.caption && (
                              <div className="truncate">{img.caption}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Gallery Image */}
                <div className="max-w-md">
                  <PackageImageUpload
                    imageType="gallery"
                    packageTitle={formData.title}
                    onImageUploaded={handleGalleryImageAdd}
                    onImageRemoved={() => {}}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Gallery Images:</strong> Showcase different aspects of your package. 
                    Images are displayed in the order added. Recommended size: 800x800px.
                  </p>
                </div>
              </div>

              {/* Image Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Image Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>Hero Image</span>
                    <Badge variant={heroImage ? 'success' : 'secondary'}>
                      {heroImage ? '✅ Set' : '❌ Missing'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>Gallery Images</span>
                    <Badge variant={galleryImages.length > 0 ? 'success' : 'secondary'}>
                      {galleryImages.length} {galleryImages.length === 1 ? 'Image' : 'Images'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>Itinerary Images</span>
                    <Badge variant="outline">
                      {itinerary.reduce((total, day) => total + (day.images?.length || 0), 0)} Total
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
		
		
		
		// src/app/dashboard/packages/edit/[id]/page.tsx - FILE 6 OF 6: SEO Tab, Submit Actions, and Component Closing

        {/* TAB 6: SEO */}
        {activeTab === 'seo' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔍</span>
                <span>SEO Optimization</span>
              </CardTitle>
              <CardDescription>Search engine optimization settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meta Title */}
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="Package title for search engines"
                  maxLength={60}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used in search engine results and browser tabs</span>
                  <span>{formData.meta_title.length}/60</span>
                </div>
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="Brief description for search engine results"
                  rows={3}
                  maxLength={160}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used in search engine result snippets</span>
                  <span>{formData.meta_description.length}/160</span>
                </div>
              </div>

              {/* Keywords */}
              <ArrayManager
                title="SEO Keywords"
                items={keywords}
                arrayName="keywords"
                placeholder="e.g. golden triangle tour"
              />

              {/* SEO Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Search Engine Preview</h4>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {formData.meta_title || formData.title || 'Package Title'}
                  </div>
                  <div className="text-green-700 text-sm">
                    yoursite.com/packages/{generateSlug(formData.title || 'package-name')}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {formData.meta_description || formData.short_description || 'Package description will appear here...'}
                  </div>
                </div>
              </div>

              {/* URL Slug */}
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <div className="bg-gray-50 px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700">
                  /packages/{generateSlug(formData.title || 'package-name')}
                </div>
                <p className="text-xs text-gray-500">
                  URL automatically generated from package title
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Actions */}
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Last saved: {packageData?.updated_at ? new Date(packageData.updated_at).toLocaleString() : 'Never'}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="flex items-center text-xs">
                    {heroImage ? '✅' : '❌'} Hero Image
                  </span>
                  <span className="flex items-center text-xs">
                    {galleryImages.length > 0 ? '✅' : '❌'} Gallery ({galleryImages.length})
                  </span>
                  <span className="flex items-center text-xs">
                    📊 {itinerary.reduce((total, day) => total + (day.images?.length || 0), 0)} Itinerary Images
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/packages')}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Updating...
                    </span>
                  ) : (
                    'Update Package'
                  )}
                </Button>
              </div>
            </div>

            {/* Validation Summary */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Please fix the following errors before submitting:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field} className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {error}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-xs text-red-600">
                  💡 Use the tab navigation above to quickly jump to sections with errors (marked with red dots)
                </div>
              </div>
            )}

            {/* Success Summary */}
            {Object.keys(validationErrors).length === 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <span className="text-green-500 text-lg mr-2">✅</span>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Ready to Update</h4>
                    <p className="text-sm text-green-700 mt-1">
                      All required fields are complete and validation passed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

// END OF COMPONENT - Complete Fixed EditPackagePage with Duplicate Prevention