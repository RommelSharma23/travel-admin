// components/admin/package-edit/shared/ImagePreview.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

interface PackageImage {
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

interface ImagePreviewProps {
  image: PackageImage
  type: 'hero' | 'gallery' | 'itinerary'
  index?: number
  dayNumber?: number
  onRemove: () => void
  onUpdate: (field: 'alt_text' | 'caption', value: string) => void
  showMetadata?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ImagePreview = ({ 
  image, 
  type, 
  index, 
  dayNumber, 
  onRemove, 
  onUpdate,
  showMetadata = true,
  size = 'md',
  className = ''
}: ImagePreviewProps) => {
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'h-20',
    md: 'h-32',
    lg: 'h-48'
  }

  const getImageBadge = () => {
    switch (type) {
      case 'hero':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Hero</span>
      case 'gallery':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Gallery {(index || 0) + 1}</span>
      case 'itinerary':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Day {dayNumber}</span>
      default:
        return null
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getImageSrc = () => {
    if (imageError) return '/placeholder-image.jpg' // You'll need a fallback image
    return image.preview || image.image_url
  }

  return (
    <>
      <div className={`relative group bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        {/* Image Container */}
        <div className="relative">
          <img
            src={getImageSrc()}
            alt={image.alt_text || 'Package image'}
            className={`w-full ${sizeClasses[size]} object-cover`}
            onError={handleImageError}
          />
          
          {/* Upload Progress Overlay */}
          {image.uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-xs">Uploading...</p>
              </div>
            </div>
          )}

          {/* Action Buttons Overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <Button
              type="button"
              onClick={() => setShowFullPreview(true)}
              size="sm"
              variant="outline"
              className="bg-white bg-opacity-90 backdrop-blur-sm p-1 h-7 w-7"
              title="Preview image"
            >
              <EyeIcon className="w-3 h-3" />
            </Button>
            
            <Button
              type="button"
              onClick={onRemove}
              size="sm"
              variant="outline"
              className="bg-white bg-opacity-90 backdrop-blur-sm text-red-600 hover:bg-red-50 p-1 h-7 w-7"
              title="Remove image"
            >
              <TrashIcon className="w-3 h-3" />
            </Button>
          </div>

          {/* Image Badge */}
          <div className="absolute top-2 left-2">
            {getImageBadge()}
          </div>

          {/* Upload Success Indicator */}
          {!image.uploading && (image.image_url || image.preview) && (
            <div className="absolute bottom-2 right-2">
              <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                ✓
              </div>
            </div>
          )}
        </div>
        
        {/* Metadata Inputs */}
        {showMetadata && (
          <div className="p-3 space-y-2">
            <div>
              <Label htmlFor={`alt-${type}-${index}-${dayNumber}`} className="text-xs text-gray-600">
                Alt Text
              </Label>
              <Input
                id={`alt-${type}-${index}-${dayNumber}`}
                placeholder="Describe the image"
                value={image.alt_text}
                onChange={(e) => onUpdate('alt_text', e.target.value)}
                className="text-xs h-8"
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1">
                {image.alt_text.length}/100
              </p>
            </div>
            
            <div>
              <Label htmlFor={`caption-${type}-${index}-${dayNumber}`} className="text-xs text-gray-600">
                Caption
              </Label>
              <Input
                id={`caption-${type}-${index}-${dayNumber}`}
                placeholder="Image caption"
                value={image.caption}
                onChange={(e) => onUpdate('caption', e.target.value)}
                className="text-xs h-8"
                maxLength={150}
              />
              <p className="text-xs text-gray-400 mt-1">
                {image.caption.length}/150
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Full Preview Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={getImageSrc()}
              alt={image.alt_text || 'Package image'}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Close Button */}
            <Button
              onClick={() => setShowFullPreview(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-75"
            >
              ✕
            </Button>
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded">
              <div className="flex items-center justify-between">
                <div>
                  {getImageBadge()}
                  {image.caption && (
                    <p className="text-sm mt-1">{image.caption}</p>
                  )}
                </div>
                <div className="text-xs text-gray-300">
                  {image.file ? `${(image.file.size / 1024 / 1024).toFixed(1)}MB` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}