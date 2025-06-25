// src/lib/image-upload.ts - FINAL FIXED VERSION
import { supabase } from './supabase'

// Allowed image types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
]

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)'
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB'
    }
  }

  return { valid: true }
}

// EXISTING FUNCTION - For destination images
export async function uploadDestinationImage(file: File, destinationName: string): Promise<UploadResult> {
  try {
    console.log('Starting destination upload for file:', file.name)
    
    // Validate file first
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${destinationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.${fileExt}`
    const filePath = `destinations/${fileName}`

    console.log('Destination upload path:', filePath)

    // Upload to Supabase Storage - FIXED: Using getaway-vibe bucket
    const { data, error } = await supabase.storage
      .from('getaway-vibe')  // ✅ FIXED: Correct bucket name
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    console.log('Destination upload response:', { data, error })

    if (error) {
      console.error('Supabase destination upload error:', error)
      return { 
        success: false, 
        error: `Upload failed: ${error.message}` 
      }
    }

    // Get public URL - FIXED: Using getaway-vibe bucket
    const { data: urlData } = supabase.storage
      .from('getaway-vibe')  // ✅ FIXED: Correct bucket name
      .getPublicUrl(filePath)

    console.log('Destination public URL:', urlData.publicUrl)

    return { success: true, url: urlData.publicUrl }

  } catch (error) {
    console.error('Destination upload error:', error)
    return { 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// MAIN FUNCTION - For package images - FULLY FIXED
export async function uploadPackageImage(
  file: File, 
  packageTitle: string, 
  imageType: 'hero' | 'gallery' | 'itinerary',
  dayNumber?: number
): Promise<UploadResult> {
  try {
    console.log('🔍 DEBUG: Starting package image upload:', { 
      file: file.name, 
      packageTitle, 
      imageType, 
      dayNumber,
      fileSize: file.size,
      fileType: file.type
    })
    
    // Validate file first
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate clean package title for folder name
    const cleanTitle = packageTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 30)

    // Generate filename components
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 6)

    // Build file path with package-images folder prefix
    let filePath = ''
    
    if (imageType === 'hero') {
      filePath = `package-images/packages/${cleanTitle}/hero/${cleanTitle}-hero-${timestamp}.${fileExt}`
    } else if (imageType === 'gallery') {
      filePath = `package-images/packages/${cleanTitle}/gallery/${cleanTitle}-gallery-${randomId}-${timestamp}.${fileExt}`
    } else if (imageType === 'itinerary' && dayNumber) {
      filePath = `package-images/packages/${cleanTitle}/itinerary/day-${dayNumber}/${cleanTitle}-day${dayNumber}-${randomId}-${timestamp}.${fileExt}`
    } else {
      return { success: false, error: 'Invalid image type or missing day number for itinerary' }
    }

    console.log('🔍 DEBUG: Package upload details:')
    console.log('Bucket: getaway-vibe')
    console.log('File path:', filePath)
    console.log('Clean title:', cleanTitle)

    // Upload to Supabase Storage - FIXED: Using getaway-vibe bucket
    const { data, error } = await supabase.storage
      .from('getaway-vibe')  // ✅ FIXED: Correct bucket name (was 'package-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Package image upload error:', error)
      
      // Provide more specific error messages
      if (error.message.includes('Bucket not found')) {
        return { success: false, error: 'Storage bucket not configured. Please contact admin.' }
      } else if (error.message.includes('already exists')) {
        return { success: false, error: 'Image with this name already exists. Please try again.' }
      } else {
        return { success: false, error: `Upload failed: ${error.message}` }
      }
    }

    // Get public URL - FIXED: Using getaway-vibe bucket
    const { data: urlData } = supabase.storage
      .from('getaway-vibe')  // ✅ FIXED: Correct bucket name
      .getPublicUrl(filePath)

    console.log('✅ Package image upload successful!')
    console.log('Public URL:', urlData.publicUrl)

    return { success: true, url: urlData.publicUrl }

  } catch (error) {
    console.error('❌ Package image upload error:', error)
    return { 
      success: false, 
      error: `Network error: ${error instanceof Error ? error.message : 'Please check your connection'}` 
    }
  }
}

// DELETE FUNCTION - For removing package images - FULLY FIXED
export async function deletePackageImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Deleting package image:', imageUrl)
    
    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathSegments = url.pathname.split('/')
    
    // Find the bucket name in the path (should be getaway-vibe)
    const bucketIndex = pathSegments.findIndex(segment => segment === 'getaway-vibe')
    
    if (bucketIndex === -1) {
      console.error('❌ Invalid image URL format - bucket not found in path')
      return { success: false, error: 'Invalid image URL format' }
    }

    // Get the file path after the bucket name
    const filePath = pathSegments.slice(bucketIndex + 1).join('/')
    
    console.log('🔍 DEBUG: Delete details:')
    console.log('Bucket: getaway-vibe')
    console.log('File path to delete:', filePath)

    // Delete from Supabase Storage - FIXED: Using getaway-vibe bucket
    const { error } = await supabase.storage
      .from('getaway-vibe')  // ✅ FIXED: Correct bucket name
      .remove([filePath])

    if (error) {
      console.error('❌ Delete error:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Successfully deleted package image')
    return { success: true }

  } catch (error) {
    console.error('❌ Package image delete error:', error)
    return { 
      success: false, 
      error: `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// UTILITY - Get image type from URL path
export function getImageTypeFromUrl(imageUrl: string): 'hero' | 'gallery' | 'itinerary' | 'unknown' {
  if (imageUrl.includes('/hero/')) return 'hero'
  if (imageUrl.includes('/gallery/')) return 'gallery'
  if (imageUrl.includes('/itinerary/')) return 'itinerary'
  return 'unknown'
}

// UTILITY - Get day number from itinerary image URL
export function getDayNumberFromUrl(imageUrl: string): number | null {
  const match = imageUrl.match(/\/day-(\d+)\//)
  return match ? parseInt(match[1]) : null
}

// UTILITY - Test bucket connection
export async function testBucketConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      return { success: false, message: `Error listing buckets: ${error.message}` }
    }
    
    const getawayVibeBucket = buckets?.find(bucket => bucket.id === 'getaway-vibe')
    
    if (!getawayVibeBucket) {
      return { success: false, message: 'getaway-vibe bucket not found' }
    }
    
    return { 
      success: true, 
      message: `✅ Connected to getaway-vibe bucket (Public: ${getawayVibeBucket.public})` 
    }
    
  } catch (error) {
    return { 
      success: false, 
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Add this TEST function to your image-upload.ts file

export async function testUploadFunction(file: File): Promise<void> {
  console.log('🧪 TEST UPLOAD FUNCTION STARTED')
  console.log('==========================================')
  
  // Test 1: Check what bucket we're trying to use
  console.log('📋 TEST 1: Bucket Configuration')
  console.log('Expected bucket: getaway-vibe')
  console.log('Expected path: package-images/packages/test/...')
  
  // Test 2: Check file details
  console.log('📋 TEST 2: File Details')
  console.log('File name:', file.name)
  console.log('File size:', file.size, 'bytes')
  console.log('File type:', file.type)
  
  // Test 3: Check Supabase connection
  console.log('📋 TEST 3: Supabase Connection Test')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Error listing buckets:', error)
      return
    }
    
    console.log('✅ Available buckets:')
    buckets?.forEach(bucket => {
      console.log(`  - ${bucket.id} (public: ${bucket.public})`)
    })
    
    const getawayBucket = buckets?.find(b => b.id === 'getaway-vibe')
    if (getawayBucket) {
      console.log('✅ getaway-vibe bucket found!')
      console.log('   Public:', getawayBucket.public)
    } else {
      console.error('❌ getaway-vibe bucket NOT found!')
    }
    
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
  }
  
  // Test 4: Test actual upload path generation
  console.log('📋 TEST 4: Path Generation Test')
  const testTitle = 'test-package'
  const timestamp = Date.now()
  const testPath = `package-images/packages/${testTitle}/gallery/test-${timestamp}.png`
  console.log('Generated test path:', testPath)
  
  // Test 5: Try actual upload to getaway-vibe bucket
  console.log('📋 TEST 5: Actual Upload Test')
  try {
    const { data, error } = await supabase.storage
      .from('getaway-vibe')  // Explicitly using getaway-vibe
      .upload(testPath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('❌ Upload failed:', error)
      console.error('Error message:', error.message)
    } else {
      console.log('✅ Upload successful!')
      console.log('Upload data:', data)
      
      // Test 6: Get public URL
      const { data: urlData } = supabase.storage
        .from('getaway-vibe')
        .getPublicUrl(testPath)
      
      console.log('✅ Public URL generated:', urlData.publicUrl)
    }
    
  } catch (error) {
    console.error('❌ Upload exception:', error)
  }
  
  console.log('==========================================')
  console.log('🧪 TEST UPLOAD FUNCTION COMPLETED')
}