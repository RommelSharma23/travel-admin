// src/components/admin/ImageUpload.tsx
'use client'

import { useState } from 'react'
import { uploadPackageImage, deletePackageImage, validateImageFile } from '@/lib/image-upload'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface ImageUploadProps {
  currentImageUrl?: string
  destinationName: string
  onImageUploaded: (url: string) => void
  onError: (error: string) => void
  imageType?: 'hero' | 'gallery' | 'itinerary'
  dayNumber?: number
  className?: string
}

export function ImageUpload({
  currentImageUrl = '',
  destinationName,
  onImageUploaded,
  onError,
  imageType = 'gallery',
  dayNumber,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      onError(validation.error || 'Invalid file')
      return
    }

    // Show preview immediately
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload to Supabase
      const result = await uploadPackageImage(file, destinationName, imageType, dayNumber)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success && result.url) {
        setPreviewUrl(result.url)
        onImageUploaded(result.url)
        
        // Clean up blob URL
        URL.revokeObjectURL(preview)
      } else {
        setPreviewUrl(currentImageUrl || null)
        onError(result.error || 'Upload failed')
      }

    } catch (error) {
      setPreviewUrl(currentImageUrl || null)
      onError('Network error during upload')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleRemoveImage = async () => {
    if (currentImageUrl) {
      setUploading(true)
      try {
        await deletePackageImage(currentImageUrl)
      } catch (error) {
        console.warn('Error deleting image from storage:', error)
      } finally {
        setUploading(false)
      }
    }

    setPreviewUrl(null)
    onImageUploaded('')
  }

  const getAspectRatio = () => {
    switch (imageType) {
      case 'hero':
        return 'aspect-video' // 16:9 for hero images
      case 'gallery':
      case 'itinerary':
        return 'aspect-square' // 1:1 for gallery and itinerary
      default:
        return 'aspect-square'
    }
  }

  const getRecommendedSize = () => {
    switch (imageType) {
      case 'hero':
        return '1200x800px recommended'
      case 'gallery':
        return '800x800px recommended' 
      case 'itinerary':
        return '600x600px recommended'
      default:
        return '800x800px recommended'
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {previewUrl ? (
        <div className="relative group">
          <div className={`${getAspectRatio()} bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-200`}>
            <img
              src={previewUrl}
              alt={`${imageType} image`}
              className="w-full h-full object-cover"
            />
            
            {/* Upload overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Uploading...</p>
                  {uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="bg-white/20 rounded-full h-1.5 w-24 mx-auto">
                        <div 
                          className="bg-white rounded-full h-1.5 transition-all duration-300"
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
          
          {/* Action buttons */}
          {!uploading && (
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => document.getElementById(`file-input-${imageType}-${dayNumber || 'main'}`)?.click()}
                className="bg-white/90 hover:bg-white h-8 w-8 p-0"
              >
                ✏️
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemoveImage}
                className="bg-white/90 hover:bg-red-50 text-red-600 h-8 w-8 p-0"
              >
                🗑️
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`${getAspectRatio()} bg-gray-100 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById(`file-input-${imageType}-${dayNumber || 'main'}`)?.click()}
        >
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mb-1">
              {getRecommendedSize()}
            </p>
            <p className="text-xs text-gray-400">
              JPEG, PNG, WebP, GIF (max 10MB)
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        id={`file-input-${imageType}-${dayNumber || 'main'}`}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {/* Image type indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {imageType === 'hero' && '🎯 Hero Image'}
          {imageType === 'gallery' && '🖼️ Gallery Image'}
          {imageType === 'itinerary' && `📅 Day ${dayNumber} Image`}
        </span>
        {previewUrl && !uploading && (
          <span className="text-green-600">✅ Uploaded</span>
        )}
      </div>
    </div>
  )
}