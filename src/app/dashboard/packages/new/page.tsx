// src/app/dashboard/packages/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ImageUpload } from '@/components/admin/ImageUpload'

// Simple PhotoIcon component to replace Heroicons
const PhotoIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>📷</div>
)

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

export default function NewPackagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  
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
  
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([{
    day_number: 1,
    day_title: '',
    day_description: '',
    activities: '',
    images: []
  }])

  const [packageImages, setPackageImages] = useState<PackageImage[]>([])

  useEffect(() => {
    fetchDestinations()
    fetchCategories()
  }, [])

  useEffect(() => {
    // Auto-adjust itinerary when duration changes
    const newDays = parseInt(formData.duration_days.toString()) || 1
    if (newDays !== itinerary.length) {
      const newItinerary = Array.from({ length: newDays }, (_, i) => ({
        day_number: i + 1,
        day_title: itinerary[i]?.day_title || '',
        day_description: itinerary[i]?.day_description || '',
        activities: itinerary[i]?.activities || '',
        images: itinerary[i]?.images || []
      }))
      setItinerary(newItinerary)
    }
  }, [formData.duration_days])

  const fetchDestinations = async () => {
    try {
      const response = await fetch('/api/destinations')
      const data = await response.json()
      
      console.log('Destinations API response:', data) // Debug log
      
      if (response.ok) {
        setDestinations(data.destinations || [])
      } else {
        console.error('Failed to fetch destinations:', data.error)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'duration_days') {
      const days = parseInt(value) || 1
      const nights = days > 0 ? days - 1 : 0
      setFormData(prev => ({ 
        ...prev, 
        duration_days: days,
        duration_nights: nights
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Array field handlers
  const addArrayItem = (field: 'inclusions' | 'exclusions' | 'highlights' | 'keywords') => {
    const setters = { inclusions: setInclusions, exclusions: setExclusions, highlights: setHighlights, keywords: setKeywords }
    const setter = setters[field]
    setter(prev => [...prev, ''])
  }

  const updateArrayItem = (field: 'inclusions' | 'exclusions' | 'highlights' | 'keywords', index: number, value: string) => {
    const setters = { inclusions: setInclusions, exclusions: setExclusions, highlights: setHighlights, keywords: setKeywords }
    const setter = setters[field]
    setter(prev => prev.map((item, i) => i === index ? value : item))
  }

  const removeArrayItem = (field: 'inclusions' | 'exclusions' | 'highlights' | 'keywords', index: number) => {
    const setters = { inclusions: setInclusions, exclusions: setExclusions, highlights: setHighlights, keywords: setKeywords }
    const arrays = { inclusions, exclusions, highlights, keywords }
    const array = arrays[field]
    const setter = setters[field]
    
    if (array.length > 1) {
      setter(prev => prev.filter((_, i) => i !== index))
    }
  }

  // Itinerary handlers
  const updateItineraryDay = (dayIndex: number, field: keyof ItineraryDay, value: string) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex ? { ...day, [field]: value } : day
    ))
  }

  const addItineraryImage = (dayIndex: number, imageUrl: string) => {
    const newImage: PackageImage = {
      image_url: imageUrl,
      image_type: 'itinerary',
      alt_text: `Day ${dayIndex + 1} image`,
      caption: `Day ${dayIndex + 1} activity`,
      sort_order: 0,
      day_number: dayIndex + 1
    }
    
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex ? { ...day, images: [...day.images, newImage] } : day
    ))
  }

  const removeItineraryImage = (dayIndex: number, imageIndex: number) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex ? { ...day, images: day.images.filter((_, ii) => ii !== imageIndex) } : day
    ))
  }

  // Package image handlers
  const addPackageImage = (imageUrl: string, type: 'hero' | 'gallery') => {
    const newImage: PackageImage = {
      image_url: imageUrl,
      image_type: type,
      alt_text: '',
      caption: '',
      sort_order: packageImages.length
    }
    setPackageImages(prev => [...prev, newImage])
  }

  const removePackageImage = (index: number) => {
    setPackageImages(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const errors = []
    
    if (!formData.title.trim()) errors.push('Title is required')
    if (!formData.destination_id) errors.push('Destination is required')
    if (!formData.duration_days || formData.duration_days < 1) errors.push('Duration must be at least 1 day')
    if (formData.price_from && formData.price_to && parseFloat(formData.price_from) > parseFloat(formData.price_to)) {
      errors.push('Price from cannot be greater than price to')
    }
    
    // Validate itinerary
    const invalidDays = itinerary.filter(day => !day.day_title.trim() || !day.day_description.trim())
    if (invalidDays.length > 0) {
      errors.push(`Day ${invalidDays[0].day_number} requires title and description`)
    }
    
    return errors
  }

  const generateReferenceNo = async (destinationId: string) => {
    try {
      const response = await fetch(`/api/packages/reference-no?destination_id=${destinationId}`)
      const data = await response.json()
      return data.reference_no
    } catch (error) {
      console.error('Error generating reference number:', error)
      return 'PKG-000-001'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const errors = validateForm()
    if (errors.length > 0) {
      setError(errors.join(', '))
      setLoading(false)
      return
    }

    try {
      const reference_no = await generateReferenceNo(formData.destination_id)
      
      const packageData = {
        ...formData,
        reference_no,
        duration_days: parseInt(formData.duration_days.toString()),
        duration_nights: parseInt(formData.duration_nights.toString()),
        max_group_size: formData.max_group_size ? parseInt(formData.max_group_size) : null,
        min_age: formData.min_age ? parseInt(formData.min_age) : null,
        price_from: formData.price_from ? parseFloat(formData.price_from) : null,
        price_to: formData.price_to ? parseFloat(formData.price_to) : null,
        destination_id: parseInt(formData.destination_id),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        inclusions: inclusions.filter(item => item.trim()),
        exclusions: exclusions.filter(item => item.trim()),
        highlights: highlights.filter(item => item.trim()),
        keywords: keywords.filter(item => item.trim()),
        itinerary,
        images: packageImages
      }

      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData)
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard/packages')
      } else {
        setError(data.error || 'Failed to create package')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getDestinationName = (destinationId: string) => {
    const dest = destinations.find(d => d.id.toString() === destinationId)
    return dest ? dest.name : ''
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'itinerary', label: 'Itinerary', icon: '🗓️' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'seo', label: 'SEO', icon: '🔍' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Package</h1>
          <p className="text-gray-600 mt-2">Add a new tour package with itinerary</p>
        </div>
        <Link href="/dashboard/packages">
          <Button variant="outline">← Back to Packages</Button>
        </Link>
      </div>

      {/* Progress Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential package details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Package Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., 7-Day Morocco Adventure Tour"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destination_id">Destination *</Label>
                  <select
                    id="destination_id"
                    name="destination_id"
                    value={formData.destination_id}
                    onChange={handleInputChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Destination</option>
                    {destinations.map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name}, {dest.country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="category_id">Category</Label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Category (Optional)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.destination_id && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Reference Number:</strong> Will be auto-generated as PKG-{getDestinationName(formData.destination_id).slice(0,3).toUpperCase()}-XXX
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="short_description">Short Description</Label>
                <textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Brief overview of the package..."
                />
              </div>

              <div>
                <Label htmlFor="long_description">Detailed Description</Label>
                <textarea
                  id="long_description"
                  name="long_description"
                  value={formData.long_description}
                  onChange={handleInputChange}
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Comprehensive description of the package..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>Duration, group size, and other specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration_days">Duration (Days) *</Label>
                  <Input
                    id="duration_days"
                    name="duration_days"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.duration_days}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration_nights">Duration (Nights)</Label>
                  <Input
                    id="duration_nights"
                    name="duration_nights"
                    type="number"
                    min="0"
                    value={formData.duration_nights}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="max_group_size">Max Group Size</Label>
                  <Input
                    id="max_group_size"
                    name="max_group_size"
                    type="number"
                    min="1"
                    value={formData.max_group_size}
                    onChange={handleInputChange}
                    placeholder="e.g., 12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_age">Minimum Age</Label>
                  <Input
                    id="min_age"
                    name="min_age"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.min_age}
                    onChange={handleInputChange}
                    placeholder="e.g., 18"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty_level">Difficulty Level</Label>
                  <select
                    id="difficulty_level"
                    name="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="availability_status">Availability Status</Label>
                <select
                  id="availability_status"
                  name="availability_status"
                  value={formData.availability_status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {AVAILABILITY_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="is_featured"
                    name="is_featured"
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_featured">Featured Package</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="is_best_selling"
                    name="is_best_selling"
                    type="checkbox"
                    checked={formData.is_best_selling}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_best_selling">Best Selling</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Package Details</CardTitle>
              <CardDescription>Set pricing, inclusions, exclusions, and highlights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price Range */}
              <div>
                <h3 className="text-lg font-medium mb-4">Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.value} value={curr.value}>
                          {curr.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="price_from">Price From</Label>
                    <Input
                      id="price_from"
                      name="price_from"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_from}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_to">Price To</Label>
                    <Input
                      id="price_to"
                      name="price_to"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_to}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                {formData.price_from && formData.price_to && parseFloat(formData.price_from) > parseFloat(formData.price_to) && (
                  <p className="text-red-600 text-sm mt-1">Price from cannot be greater than price to</p>
                )}
              </div>

              {/* Inclusions */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">What's Included</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('inclusions')}
                  >
                    ➕ Add Inclusion
                  </Button>
                </div>
                <div className="space-y-2">
                  {inclusions.map((inclusion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={inclusion}
                        onChange={(e) => updateArrayItem('inclusions', index, e.target.value)}
                        placeholder="e.g., All meals included"
                        className="flex-1"
                      />
                      {inclusions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('inclusions', index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">What's Not Included</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('exclusions')}
                  >
                    ➕ Add Exclusion
                  </Button>
                </div>
                <div className="space-y-2">
                  {exclusions.map((exclusion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={exclusion}
                        onChange={(e) => updateArrayItem('exclusions', index, e.target.value)}
                        placeholder="e.g., International flights"
                        className="flex-1"
                      />
                      {exclusions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('exclusions', index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Package Highlights</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('highlights')}
                  >
                    ➕ Add Highlight
                  </Button>
                </div>
                <div className="space-y-2">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={highlight}
                        onChange={(e) => updateArrayItem('highlights', index, e.target.value)}
                        placeholder="e.g., Visit to ancient monuments"
                        className="flex-1"
                      />
                      {highlights.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('highlights', index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              {(formData.price_from || formData.price_to) && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Pricing Summary</h4>
                  <div className="text-blue-800">
                    {formData.price_from && formData.price_to ? (
                      <p>
                        Price Range: <strong>{formData.currency} {formData.price_from} - {formData.currency} {formData.price_to}</strong>
                      </p>
                    ) : formData.price_from ? (
                      <p>
                        Starting from: <strong>{formData.currency} {formData.price_from}</strong>
                      </p>
                    ) : (
                      <p>
                        Up to: <strong>{formData.currency} {formData.price_to}</strong>
                      </p>
                    )}
                    <p className="text-sm mt-1">
                      Duration: {formData.duration_days} day{formData.duration_days > 1 ? 's' : ''} 
                      {formData.duration_nights > 0 && `, ${formData.duration_nights} night${formData.duration_nights > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <Card>
            <CardHeader>
              <CardTitle>Day-by-Day Itinerary</CardTitle>
              <CardDescription>
                Create detailed itinerary for {formData.duration_days} day{formData.duration_days > 1 ? 's' : ''} tour
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Itinerary Overview */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Itinerary Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-blue-800">
                  <div>
                    <span className="text-sm text-blue-600">Duration:</span>
                    <p className="font-medium">{formData.duration_days} Days</p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600">Nights:</span>
                    <p className="font-medium">{formData.duration_nights} Nights</p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600">Completed Days:</span>
                    <p className="font-medium">
                      {itinerary.filter(day => day.day_title.trim() && day.day_description.trim()).length} / {formData.duration_days}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600">Progress:</span>
                    <p className="font-medium">
                      {Math.round((itinerary.filter(day => day.day_title.trim() && day.day_description.trim()).length / formData.duration_days) * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Itinerary Days */}
              <div className="space-y-6">
                {itinerary.map((day, index) => (
                  <Card key={index} className="border-l-4 border-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Day {day.day_number}
                          {day.day_title && `: ${day.day_title}`}
                        </CardTitle>
                        <Badge 
                          variant={day.day_title.trim() && day.day_description.trim() ? 'success' : 'secondary'}
                          className="text-xs"
                        >
                          {day.day_title.trim() && day.day_description.trim() ? 'Complete' : 'Incomplete'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Day Title */}
                      <div>
                        <Label htmlFor={`day_title_${index}`}>Day Title *</Label>
                        <Input
                          id={`day_title_${index}`}
                          value={day.day_title}
                          onChange={(e) => updateItineraryDay(index, 'day_title', e.target.value)}
                          placeholder={`e.g., Arrival in ${getDestinationName(formData.destination_id)}`}
                          className={!day.day_title.trim() ? 'border-red-300' : ''}
                        />
                        {!day.day_title.trim() && (
                          <p className="text-red-600 text-xs mt-1">Day title is required</p>
                        )}
                      </div>

                      {/* Day Description */}
                      <div>
                        <Label htmlFor={`day_description_${index}`}>Day Description *</Label>
                        <textarea
                          id={`day_description_${index}`}
                          value={day.day_description}
                          onChange={(e) => updateItineraryDay(index, 'day_description', e.target.value)}
                          rows={4}
                          className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            !day.day_description.trim() ? 'border-red-300' : 'border-input'
                          }`}
                          placeholder="Describe the activities and experiences for this day..."
                        />
                        {!day.day_description.trim() && (
                          <p className="text-red-600 text-xs mt-1">Day description is required</p>
                        )}
                      </div>

                      {/* Activities */}
                      <div>
                        <Label htmlFor={`activities_${index}`}>Activities (Optional)</Label>
                        <textarea
                          id={`activities_${index}`}
                          value={day.activities}
                          onChange={(e) => updateItineraryDay(index, 'activities', e.target.value)}
                          rows={2}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="e.g., City tour, museum visits, local market exploration..."
                        />
                      </div>

                      {/* Day Images */}
                      <div>
                        <Label>Day {day.day_number} Images (Optional)</Label>
                        <div className="space-y-3">
                          {/* Current Images */}
                          {day.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {day.images.map((image, imgIndex) => (
                                <div key={imgIndex} className="relative group">
                                  <img
                                    src={image.image_url}
                                    alt={image.alt_text || `Day ${day.day_number} image`}
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeItineraryImage(index, imgIndex)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ✕
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                                    {image.caption || 'No caption'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Use ImageUpload component */}
                          <ImageUpload
                            currentImageUrl=""
                            destinationName={`day-${day.day_number}`}
                            onImageUploaded={(url) => addItineraryImage(index, url)}
                            onError={(error) => console.error('Image upload error:', error)}
                          />
                        </div>
                      </div>

                      {/* Day Summary */}
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Day {day.day_number} Summary</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className={`ml-2 font-medium ${
                              day.day_title.trim() && day.day_description.trim() 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {day.day_title.trim() && day.day_description.trim() ? 'Complete' : 'Incomplete'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Images:</span>
                            <span className="ml-2 font-medium text-blue-600">
                              {day.images.length} image{day.images.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Title Length:</span>
                            <span className="ml-2 font-medium">
                              {day.day_title.length} chars
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Description Length:</span>
                            <span className="ml-2 font-medium">
                              {day.day_description.length} chars
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Itinerary Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  💡 <strong>Tip:</strong> Each day should have a clear title and detailed description. 
                  Images help travelers visualize the experience.
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Auto-fill sample data for testing
                      const sampleItinerary = itinerary.map((day, index) => ({
                        ...day,
                        day_title: day.day_title || `Day ${index + 1} - Exploration`,
                        day_description: day.day_description || `Exciting activities and sightseeing planned for day ${index + 1} of your journey.`,
                        activities: day.activities || 'Guided tours, local experiences, meals'
                      }))
                      setItinerary(sampleItinerary)
                    }}
                    className="text-xs"
                  >
                    🎯 Quick Fill Sample Data
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Clear all itinerary data
                      const clearedItinerary = itinerary.map(day => ({
                        ...day,
                        day_title: '',
                        day_description: '',
                        activities: '',
                        images: []
                      }))
                      setItinerary(clearedItinerary)
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    🗑️ Clear All
                  </Button>
                </div>
              </div>

              {/* Validation Summary */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">📋 Itinerary Validation</h4>
                <div className="space-y-2 text-sm">
                  {itinerary.map((day, index) => {
                    const isComplete = day.day_title.trim() && day.day_description.trim()
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-yellow-800">
                          Day {day.day_number}: {day.day_title || 'Untitled'}
                        </span>
                        <Badge variant={isComplete ? 'success' : 'secondary'} className="text-xs">
                          {isComplete ? '✅ Complete' : '⚠️ Needs attention'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
                
                {/* Overall Progress */}
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-yellow-900">Overall Progress:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-yellow-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(itinerary.filter(day => day.day_title.trim() && day.day_description.trim()).length / formData.duration_days) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-yellow-800">
                        {Math.round((itinerary.filter(day => day.day_title.trim() && day.day_description.trim()).length / formData.duration_days) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {itinerary.filter(day => day.day_title.trim() && day.day_description.trim()).length === formData.duration_days && (
                    <div className="mt-2 text-green-700 text-sm font-medium">
                      🎉 Itinerary is complete! Ready to proceed to next step.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <Card>
            <CardHeader>
              <CardTitle>Package Images</CardTitle>
              <CardDescription>Upload hero image and gallery photos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Image */}
              <div>
                <h3 className="text-lg font-medium mb-4">Hero Image (Required)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Upload the main image that will represent this package
                </p>
                <ImageUpload
                  currentImageUrl={packageImages.find(img => img.image_type === 'hero')?.image_url || ''}
                  destinationName={formData.title || 'package'}
                  onImageUploaded={(url) => {
                    // Remove existing hero image and add new one
                    setPackageImages(prev => [
                      ...prev.filter(img => img.image_type !== 'hero'),
                      {
                        image_url: url,
                        image_type: 'hero',
                        alt_text: formData.title,
                        caption: formData.title,
                        sort_order: 0
                      }
                    ])
                  }}
                  onError={(error) => console.error('Hero image upload error:', error)}
                />
              </div>

              {/* Gallery Images */}
              <div>
                <h3 className="text-lg font-medium mb-4">Gallery Images (Optional)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Add additional images to showcase different aspects of the package
                </p>
                
                {/* Current Gallery Images */}
                {packageImages.filter(img => img.image_type === 'gallery').length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {packageImages
                      .filter(img => img.image_type === 'gallery')
                      .map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.image_url}
                            alt={image.alt_text || 'Gallery image'}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePackageImage(
                              packageImages.findIndex(img => img === image)
                            )}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {/* Add Gallery Image */}
                <ImageUpload
                  currentImageUrl=""
                  destinationName={`${formData.title || 'package'}-gallery`}
                  onImageUploaded={(url) => addPackageImage(url, 'gallery')}
                  onError={(error) => console.error('Gallery image upload error:', error)}
                />
              </div>

              {/* Image Summary */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Image Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Hero Images:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      {packageImages.filter(img => img.image_type === 'hero').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gallery Images:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {packageImages.filter(img => img.image_type === 'gallery').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Itinerary Images:</span>
                    <span className="ml-2 font-medium text-purple-600">
                      {itinerary.reduce((total, day) => total + day.images.length, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <Card>
            <CardHeader>
              <CardTitle>SEO & Keywords</CardTitle>
              <CardDescription>Optimize for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleInputChange}
                  placeholder="SEO-optimized title for search engines"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended length: 50-60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Brief description for search engine results..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended length: 150-160 characters
                </p>
              </div>

              {/* Keywords */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label>SEO Keywords</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('keywords')}
                  >
                    ➕ Add Keyword
                  </Button>
                </div>
                <div className="space-y-2">
                  {keywords.map((keyword, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={keyword}
                        onChange={(e) => updateArrayItem('keywords', index, e.target.value)}
                        placeholder="e.g., morocco tour, adventure travel"
                        className="flex-1"
                      />
                      {keywords.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('keywords', index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add relevant keywords that travelers might search for
                </p>
              </div>

              {/* SEO Preview */}
              {(formData.meta_title || formData.meta_description) && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Search Engine Preview</h4>
                  <div className="space-y-1">
                    <div className="text-blue-600 text-lg font-medium">
                      {formData.meta_title || formData.title || 'Package Title'}
                    </div>
                    <div className="text-green-600 text-sm">
                      yoursite.com/packages/{formData.title?.toLowerCase().replace(/\s+/g, '-') || 'package-name'}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {formData.meta_description || formData.short_description || 'Package description will appear here...'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Navigation */}
        <div className="flex justify-between">
          <div>
            {activeTab !== 'basic' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1].id)
                  }
                }}
              >
                ← Previous
              </Button>
            )}
          </div>
          
          <div className="space-x-2">
            {activeTab !== 'seo' ? (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id)
                  }
                }}
              >
                Next →
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Package...' : 'Create Package'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}