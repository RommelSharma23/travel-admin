// src/app/dashboard/categories/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ImageUpload } from '@/components/admin/ImageUpload'

export default function NewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image_url: '',
    color: '#6366F1',
    is_active: true
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }))
    setError('') // Clear any previous errors
  }

  const handleImageError = (error: string) => {
    setError(error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Submitting:', formData)
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log('Response:', data)

      if (response.ok) {
        router.push('/dashboard/categories')
      } else {
        setError(data.error || 'Failed to create category')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Generate slug preview
  const slugPreview = formData.name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
          <p className="text-gray-600 mt-2">Create a new travel category or theme</p>
        </div>
        <Link href="/dashboard/categories">
          <Button variant="outline">
            ← Back to Categories
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential category details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Adventure Tours"
                  required
                />
                {slugPreview && (
                  <p className="text-xs text-gray-500 mt-1">
                    URL slug: <code className="bg-gray-100 px-1 rounded">{slugPreview}</code>
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="icon">Icon (Emoji) *</Label>
                <Input
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="🏔️"
                  maxLength={2}
                  className="text-center text-2xl"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Choose an emoji to represent this category
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe this category and what types of destinations it includes..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Visual Customization */}
        <Card>
          <CardHeader>
            <CardTitle>Visual Customization</CardTitle>
            <CardDescription>Customize how this category appears on your website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Selection */}
            <div>
              <Label htmlFor="color">Category Color</Label>
              <div className="flex gap-3 items-center mt-2">
                <div className="flex gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                    title="Choose category color"
                  />
                  <Input
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="#6366F1"
                    className="w-24 font-mono text-sm"
                  />
                </div>
                
                {/* Color Presets */}
                <div className="flex gap-1">
                  {[
                    '#6366F1', '#EF4444', '#10B981', '#F59E0B', 
                    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This color will be used for category badges and highlights
              </p>
            </div>

            {/* Live Preview */}
            <div>
              <Label>Live Preview</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">Badge style:</div>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: formData.color,
                      color: formData.color
                    }}
                  >
                    {formData.icon || '📂'} {formData.name || 'Category Name'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="text-sm text-gray-600">Card preview:</div>
                  <div 
                    className="px-3 py-2 rounded-lg border flex items-center gap-2 text-sm"
                    style={{ 
                      backgroundColor: formData.color + '10',
                      borderColor: formData.color + '30'
                    }}
                  >
                    <span className="text-lg">{formData.icon || '📂'}</span>
                    <span style={{ color: formData.color }}>
                      {formData.name || 'Category Name'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Image */}
        <Card>
          <CardHeader>
            <CardTitle>Category Image</CardTitle>
            <CardDescription>Upload an optional hero image for this category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              currentImageUrl={formData.image_url}
              destinationName={formData.name || 'category'}
              onImageUploaded={handleImageUploaded}
              onError={handleImageError}
            />
            
            <div className="pt-4 border-t border-gray-200">
              <Label htmlFor="image_url_manual">Or enter image URL manually</Label>
              <Input
                id="image_url_manual"
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can either upload an image above or enter a direct URL here
              </p>
            </div>

            {/* Image Preview */}
            {formData.image_url && (
              <div className="pt-4 border-t border-gray-200">
                <Label>Image Preview</Label>
                <div className="mt-2">
                  <div className="relative w-full max-w-sm aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={formData.image_url}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                      onError={() => setError('Failed to load image from URL')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-2xl mb-1">{formData.icon || '📂'}</div>
                        <div className="font-semibold">{formData.name || 'Category Name'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Category status and visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="is_active">Active Category</Label>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Only active categories will be available for selection when creating or editing destinations. 
                Inactive categories are hidden from public-facing category filters.
              </p>
            </div>

            {/* Quick Info */}
            <div className="bg-gray-50 border border-gray-200 p-3 rounded">
              <h4 className="font-medium text-gray-900 mb-2">Category Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div><strong>Name:</strong> {formData.name || 'Not set'}</div>
                <div><strong>Slug:</strong> {slugPreview || 'Not generated'}</div>
                <div><strong>Icon:</strong> {formData.icon || 'Not set'}</div>
                <div><strong>Color:</strong> {formData.color}</div>
                <div><strong>Status:</strong> {formData.is_active ? 'Active' : 'Inactive'}</div>
                <div><strong>Has Image:</strong> {formData.image_url ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/categories">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading || !formData.name}>
            {loading ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  )
}