// src/app/dashboard/destinations/new/page.tsx (Enhanced with Categories)
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface Category {
  id: number
  name: string
  description: string | null
  icon: string | null
  is_active: boolean
}

export default function NewDestinationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    hero_image: '',
    category_id: '',
    featured: false,
    status: 'draft'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories || [])
      } else {
        console.error('Failed to fetch categories:', data.error)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }

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
    setFormData(prev => ({ ...prev, hero_image: url }))
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
      // Prepare data for submission
      const submitData = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null
      }

      console.log('Submitting:', submitData)
      
      const response = await fetch('/api/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()
      console.log('Response:', data)

      if (response.ok) {
        router.push('/dashboard/destinations')
      } else {
        setError(data.error || 'Failed to create destination')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Destination</h1>
          <p className="text-gray-600 mt-2">Create a new travel destination</p>
        </div>
        <Link href="/dashboard/destinations">
          <Button variant="outline">
            ← Back to Destinations
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
            <CardDescription>Essential destination details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Destination Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Santorini"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g., Greece"
                  required
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <Label htmlFor="category_id">Travel Category</Label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                disabled={categoriesLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select a category (optional)'}
                </option>
                {categories
                  .filter(cat => cat.is_active)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon && `${category.icon} `}{category.name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose a travel theme that best describes this destination
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe this destination..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Hero Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Image</CardTitle>
            <CardDescription>Upload the main image for this destination</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImageUrl={formData.hero_image}
              destinationName={formData.name || 'destination'}
              onImageUploaded={handleImageUploaded}
              onError={handleImageError}
            />
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Publication status and features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Publication Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="draft">Draft (Not visible on website)</option>
                <option value="published">Published (Live on website)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="featured">Featured Destination</Label>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Destinations are saved as drafts by default and won't appear on the main website until published.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/destinations">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Destination'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// =============================================================================
// src/app/dashboard/destinations/edit/[id]/page.tsx (Enhanced with Categories)
// =============================================================================

/*
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface PageProps {
  params: { id: string }
}

interface Category {
  id: number
  name: string
  description: string | null
  icon: string | null
  is_active: boolean
}

export default function EditDestinationPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    hero_image: '',
    category_id: '',
    featured: false,
    status: 'draft'
  })

  useEffect(() => {
    fetchDestination()
    fetchCategories()
  }, [params.id])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories || [])
      } else {
        console.error('Failed to fetch categories:', data.error)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchDestination = async () => {
    try {
      const response = await fetch(`/api/destinations/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        const dest = data.destination
        setFormData({
          name: dest.name || '',
          country: dest.country || '',
          description: dest.description || '',
          hero_image: dest.hero_image || '',
          category_id: dest.category_id ? dest.category_id.toString() : '',
          featured: dest.featured || false,
          status: dest.status || 'draft'
        })
      } else {
        setError(data.error || 'Failed to fetch destination')
      }
    } catch (error) {
      setError('Network error while fetching destination')
    } finally {
      setFetchLoading(false)
    }
  }

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
    setFormData(prev => ({ ...prev, hero_image: url }))
    setError('')
  }

  const handleImageError = (error: string) => {
    setError(error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null
      }

      console.log('Updating:', submitData)
      
      const response = await fetch(`/api/destinations/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()
      console.log('Response:', data)

      if (response.ok) {
        router.push('/dashboard/destinations')
      } else {
        setError(data.error || 'Failed to update destination')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Edit Destination</h1>
          <Link href="/dashboard/destinations">
            <Button variant="outline">← Back to Destinations</Button>
          </Link>
        </div>
        <div className="text-center py-8">Loading destination...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Destination</h1>
          <p className="text-gray-600 mt-2">Update destination information</p>
        </div>
        <Link href="/dashboard/destinations">
          <Button variant="outline">← Back to Destinations</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential destination details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Destination Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Santorini"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g., Greece"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category_id">Travel Category</Label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                disabled={categoriesLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select a category (optional)'}
                </option>
                {categories
                  .filter(cat => cat.is_active)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon && `${category.icon} `}{category.name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose a travel theme that best describes this destination
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe this destination..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hero Image</CardTitle>
            <CardDescription>Upload or update the main image for this destination</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImageUrl={formData.hero_image}
              destinationName={formData.name || 'destination'}
              onImageUploaded={handleImageUploaded}
              onError={handleImageError}
            />
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Label htmlFor="hero_image_url">Or enter image URL manually</Label>
              <Input
                id="hero_image_url"
                name="hero_image"
                type="url"
                value={formData.hero_image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can either upload an image above or enter a direct URL here
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Publication status and features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Publication Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="draft">Draft (Not visible on website)</option>
                <option value="published">Published (Live on website)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="featured">Featured Destination</Label>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Only published destinations appear on the main website.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/destinations">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Destination'}
          </Button>
        </div>
      </form>
    </div>
  )
}
*/