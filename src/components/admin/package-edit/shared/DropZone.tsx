// components/admin/package-edit/shared/DropZone.tsx
'use client'

import { useState, useCallback } from 'react'

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

interface DropZoneProps {
  onFileSelect: (files: FileList | null, type: 'hero' | 'gallery' | 'itinerary', dayNumber?: number) => void
  type: 'hero' | 'gallery' | 'itinerary'
  dayNumber?: number
  multiple?: boolean
  children: React.ReactNode
  accept?: string
  maxSize?: number // in MB
  disabled?: boolean
  className?: string
}

export const DropZone = ({
  onFileSelect,
  type,
  dayNumber,
  multiple = false,
  children,
  accept = 'image/*',
  maxSize = 5,
  disabled = false,
  className = ''
}: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const validateFiles = useCallback((files: FileList): { valid: File[], errors: string[] } => {
    const valid: File[] = []
    const errors: string[] = []
    const maxSizeBytes = maxSize * 1024 * 1024

    Array.from(files).forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not a valid image file`)
        return
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name} is too large (max ${maxSize}MB)`)
        return
      }

      valid.push(file)
    })

    return { valid, errors }
  }, [maxSize])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragging(false)
      }
      return newCounter
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDragCounter(0)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const { valid, errors } = validateFiles(files)
      
      if (errors.length > 0) {
        // You might want to show these errors through a toast or callback
        console.error('File validation errors:', errors)
        // Could emit errors through a callback prop
      }

      if (valid.length > 0) {
        const fileList = new DataTransfer()
        valid.forEach(file => fileList.items.add(file))
        onFileSelect(fileList.files, type, dayNumber)
      }
    }
  }, [disabled, validateFiles, onFileSelect, type, dayNumber])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const { valid, errors } = validateFiles(files)
      
      if (errors.length > 0) {
        console.error('File validation errors:', errors)
      }

      if (valid.length > 0) {
        const fileList = new DataTransfer()
        valid.forEach(file => fileList.items.add(file))
        onFileSelect(fileList.files, type, dayNumber)
      }
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }, [validateFiles, onFileSelect, type, dayNumber])

  const inputId = `file-input-${type}-${dayNumber || 'main'}`

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-all duration-200 ${
        isDragging 
          ? 'transform scale-[1.02]' 
          : ''
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
        id={inputId}
        disabled={disabled}
      />
      
      <label
        htmlFor={disabled ? undefined : inputId}
        className={`block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className={`transition-colors duration-200 ${
          isDragging 
            ? 'bg-blue-50 border-blue-300 scale-[1.01]' 
            : ''
        }`}>
          {children}
        </div>
      </label>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-10 border-2 border-dashed border-blue-400 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-blue-400">
            <UploadIcon className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-700 font-medium">Drop files here</p>
          </div>
        </div>
      )}
    </div>
  )
}