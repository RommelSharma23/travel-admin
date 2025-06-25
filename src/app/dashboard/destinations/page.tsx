// src/app/dashboard/destinations/page.tsx (Enhanced with Categories)
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Category {
  id: number
  name: string
  icon: string | null
  color: string | null
}

interface Destination {
  id: number
  name: string
  slug: string
  country: string
  description: string | null
  hero_image: string | null
  featured: boolean
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  category_id: number | null
  gallery: string[] | null
  categories?: Category | null
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchDestinations()
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

  const fetchDestinations = async () => {
    try {
      const response = await fetch('/api/destinations')
      const data = await response.json()

      if (response.ok) {
        setDestinations(data.destinations || [])
      } else {
        setError(data.error || 'Failed to fetch destinations')
      }
    } catch (error) {
      setError('Network error while fetching destinations')
    } finally {
      setLoading(false)
    }
  }

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.country.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === '' || 
                           destination.category_id?.toString() === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const togglePublishStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published'
      const published_at = newStatus === 'published' ? new Date().toISOString() : null
      
      const response = await fetch(`/api/destinations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          published_at
        })
      })

      if (response.ok) {
        setDestinations(destinations.map(dest => 
          dest.id === id ? { 
            ...dest, 
            status: newStatus as any,
            published_at
          } : dest
        ))
      }
    } catch (error) {
      console.error('Error updating publish status:', error)
    }
  }

  const toggleFeatured = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/destinations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentStatus })
      })

      if (response.ok) {
        setDestinations(destinations.map(dest => 
          dest.id === id ? { ...dest, featured: !currentStatus } : dest
        ))
      }
    } catch (error) {
      console.error('Error updating featured status:', error)
    }
  }

  const deleteDestination = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/destinations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDestinations(destinations.filter(dest => dest.id !== id))
      } else {
        alert('Failed to delete destination')
      }
    } catch (error) {
      console.error('Error deleting destination:', error)
      alert('Error deleting destination')
    }
  }

  const getCategoryById = (categoryId: number | null) => {
    if (!categoryId) return null
    return categories.find(cat => cat.id === categoryId)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Destinations</h1>
        </div>
        <div className="text-center py-8">Loading destinations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
          <p className="text-gray-600 mt-2">Manage travel destinations and locations</p>
        </div>
        <Link href="/dashboard/destinations/new">
          <Button>
            <span className="mr-2">➕</span>
            Add Destination
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{destinations.length}</div>
            <p className="text-xs text-muted-foreground">Total Destinations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {destinations.filter(d => d.status === 'published').length}
            </div>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {destinations.filter(d => d.status === 'draft').length}
            </div>
            <p className="text-xs text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {destinations.filter(d => d.featured).length}
            </div>
            <p className="text-xs text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <Input
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={categoriesLoading}
                className="flex h-10 w-full md:w-auto md:min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon && `${category.icon} `}{category.name}
                  </option>
                ))}
              </select>
              
              <Button variant="outline">
                🔍 Search
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                📱 Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                📋 List
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {getCategoryById(parseInt(selectedCategory))?.name}
                  <button 
                    onClick={() => setSelectedCategory('')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                }}
                className="h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map((destination) => {
            const category = getCategoryById(destination.category_id)
            
            return (
              <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  {destination.hero_image ? (
                    <img
                      src={destination.hero_image}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      🏝️ No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 space-y-1">
                    <Badge 
                      variant={destination.status === 'published' ? 'success' : 'secondary'} 
                      className="text-xs"
                    >
                      {destination.status}
                    </Badge>
                    {destination.featured && (
                      <Badge variant="warning" className="text-xs block">Featured</Badge>
                    )}
                  </div>
                  {/* Category Badge */}
                  {category && (
                    <div className="absolute top-2 left-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-white/90 backdrop-blur-sm"
                        style={{ 
                          borderColor: category.color || '#6366F1',
                          color: category.color || '#6366F1'
                        }}
                      >
                        {category.icon} {category.name}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg leading-tight">{destination.name}</CardTitle>
                  <CardDescription className="text-sm">{destination.country}</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {destination.description || 'No description available'}
                  </p>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/destinations/edit/${destination.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          ✏️ Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatured(destination.id, destination.featured)}
                        className="flex-1"
                      >
                        {destination.featured ? '⭐ Unfeature' : '⭐ Feature'}
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant={destination.status === 'published' ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => togglePublishStatus(destination.id, destination.status)}
                        className="flex-1"
                      >
                        {destination.status === 'published' ? '📤 Unpublish' : '📢 Publish'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteDestination(destination.id, destination.name)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDestinations.map((destination) => {
                    const category = getCategoryById(destination.category_id)
                    
                    return (
                      <tr key={destination.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {destination.hero_image ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={destination.hero_image}
                                  alt={destination.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                                  🏝️
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {destination.name}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {destination.description || 'No description'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {destination.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {category ? (
                            <Badge 
                              variant="outline"
                              style={{ 
                                borderColor: category.color || '#6366F1',
                                color: category.color || '#6366F1'
                              }}
                            >
                              {category.icon} {category.name}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={destination.status === 'published' ? 'success' : 'secondary'}>
                            {destination.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {destination.featured ? (
                            <Badge variant="warning">Featured</Badge>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link href={`/dashboard/destinations/edit/${destination.id}`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFeatured(destination.id, destination.featured)}
                          >
                            {destination.featured ? 'Unfeature' : 'Feature'}
                          </Button>
                          <Button
                            variant={destination.status === 'published' ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() => togglePublishStatus(destination.id, destination.status)}
                          >
                            {destination.status === 'published' ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteDestination(destination.id, destination.name)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredDestinations.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🏝️</div>
            <h3 className="text-lg font-semibold mb-2">No destinations found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory ? 'Try adjusting your search or filter terms' : 'Get started by adding your first destination'}
            </p>
            <Link href="/dashboard/destinations/new">
              <Button>Add Your First Destination</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}