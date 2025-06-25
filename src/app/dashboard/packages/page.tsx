// src/app/dashboard/packages/page.tsx
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
  country: string
}

interface Package {
  id: number
  reference_no: string
  title: string
  slug: string
  short_description: string | null
  duration_days: number
  duration_nights: number | null
  price_from: number | null
  price_to: number | null
  currency: string
  difficulty_level: string | null
  availability_status: string
  is_featured: boolean
  is_best_selling: boolean
  is_active: boolean
  created_at: string
  destination_id: number | null
  category_id: number | null
  destinations?: Destination | null
  categories?: Category | null
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchPackages()
    fetchCategories()
    fetchDestinations()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      const data = await response.json()

      if (response.ok) {
        setPackages(data.packages || [])
      } else {
        setError(data.error || 'Failed to fetch packages')
      }
    } catch (error) {
      setError('Network error while fetching packages')
    } finally {
      setLoading(false)
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

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.reference_no.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === '' || 
                           pkg.category_id?.toString() === selectedCategory
    
    const matchesDestination = selectedDestination === '' || 
                              pkg.destination_id?.toString() === selectedDestination

    const matchesStatus = statusFilter === '' ||
                         (statusFilter === 'featured' && pkg.is_featured) ||
                         (statusFilter === 'best_selling' && pkg.is_best_selling) ||
                         (statusFilter === 'active' && pkg.is_active) ||
                         (statusFilter === 'inactive' && !pkg.is_active)
    
    return matchesSearch && matchesCategory && matchesDestination && matchesStatus
  })

  const togglePackageStatus = async (id: number, field: 'is_featured' | 'is_best_selling' | 'is_active', currentValue: boolean) => {
    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue })
      })

      if (response.ok) {
        setPackages(packages.map(pkg => 
          pkg.id === id ? { ...pkg, [field]: !currentValue } : pkg
        ))
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
    }
  }

  const deletePackage = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPackages(packages.filter(pkg => pkg.id !== id))
      } else {
        alert('Failed to delete package')
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      alert('Error deleting package')
    }
  }

  const getCategoryById = (categoryId: number | null) => {
    if (!categoryId) return null
    return categories.find(cat => cat.id === categoryId)
  }

  const getDestinationById = (destinationId: number | null) => {
    if (!destinationId) return null
    return destinations.find(dest => dest.id === destinationId)
  }

  const formatPrice = (priceFrom: number | null, priceTo: number | null, currency: string) => {
    if (priceFrom && priceTo) {
      return `${currency} ${priceFrom} - ${priceTo}`
    } else if (priceFrom) {
      return `From ${currency} ${priceFrom}`
    } else if (priceTo) {
      return `Up to ${currency} ${priceTo}`
    }
    return 'Price on request'
  }

  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800'
      case 'Challenging': return 'bg-orange-100 text-orange-800'
      case 'Expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tour Packages</h1>
        </div>
        <div className="text-center py-8">Loading packages...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tour Packages</h1>
          <p className="text-gray-600 mt-2">Manage travel packages and tours</p>
        </div>
        <Link href="/dashboard/packages/new">
          <Button>
            <span className="mr-2">➕</span>
            Add Package
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{packages.length}</div>
            <p className="text-xs text-muted-foreground">Total Packages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {packages.filter(p => p.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {packages.filter(p => p.is_featured).length}
            </div>
            <p className="text-xs text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {packages.filter(p => p.is_best_selling).length}
            </div>
            <p className="text-xs text-muted-foreground">Best Selling</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {packages.filter(p => p.availability_status === 'Available').length}
            </div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <Input
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Destinations</option>
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="featured">Featured</option>
              <option value="best_selling">Best Selling</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1"
              >
                📱
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                📋
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory || selectedDestination || statusFilter) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {getCategoryById(parseInt(selectedCategory))?.name}
                  <button onClick={() => setSelectedCategory('')} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {selectedDestination && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Destination: {getDestinationById(parseInt(selectedDestination))?.name}
                  <button onClick={() => setSelectedDestination('')} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter.replace('_', ' ')}
                  <button onClick={() => setStatusFilter('')} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setSelectedDestination('')
                  setStatusFilter('')
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const category = getCategoryById(pkg.category_id)
            const destination = getDestinationById(pkg.destination_id)
            
            return (
              <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs">
                      {pkg.reference_no}
                    </Badge>
                    <div className="flex gap-1">
                      {pkg.is_featured && <Badge variant="warning" className="text-xs">Featured</Badge>}
                      {pkg.is_best_selling && <Badge variant="success" className="text-xs">Best Selling</Badge>}
                      {!pkg.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight">{pkg.title}</CardTitle>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {destination && (
                      <span>📍 {destination.name}</span>
                    )}
                    {category && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: category.color || '#6366F1',
                          color: category.color || '#6366F1'
                        }}
                      >
                        {category.icon} {category.name}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {pkg.short_description || 'No description available'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">
                        {pkg.duration_days} day{pkg.duration_days > 1 ? 's' : ''}
                        {pkg.duration_nights && `, ${pkg.duration_nights} night${pkg.duration_nights > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    
                    {pkg.difficulty_level && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Difficulty:</span>
                        <Badge className={getDifficultyColor(pkg.difficulty_level)}>
                          {pkg.difficulty_level}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium text-blue-600">
                        {formatPrice(pkg.price_from, pkg.price_to, pkg.currency)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <Badge 
                        variant={pkg.availability_status === 'Available' ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {pkg.availability_status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/packages/edit/${pkg.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          ✏️ Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePackageStatus(pkg.id, 'is_featured', pkg.is_featured)}
                        className="flex-1"
                      >
                        {pkg.is_featured ? '⭐ Unfeature' : '⭐ Feature'}
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePackageStatus(pkg.id, 'is_active', pkg.is_active)}
                        className="flex-1"
                      >
                        {pkg.is_active ? '📤 Deactivate' : '📢 Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePackage(pkg.id, pkg.title)}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPackages.map((pkg) => {
                    const destination = getDestinationById(pkg.destination_id)
                    
                    return (
                      <tr key={pkg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{pkg.title}</div>
                            <div className="text-sm text-gray-500">{pkg.reference_no}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{destination?.name || '—'}</td>
                        <td className="px-6 py-4 text-sm">
                          {pkg.duration_days}D{pkg.duration_nights ? `/${pkg.duration_nights}N` : ''}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatPrice(pkg.price_from, pkg.price_to, pkg.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant={pkg.is_active ? 'success' : 'secondary'} className="text-xs w-fit">
                              {pkg.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {pkg.is_featured && <Badge variant="warning" className="text-xs w-fit">Featured</Badge>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Link href={`/dashboard/packages/edit/${pkg.id}`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePackageStatus(pkg.id, 'is_featured', pkg.is_featured)}
                            >
                              {pkg.is_featured ? 'Unfeature' : 'Feature'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deletePackage(pkg.id, pkg.title)}
                            >
                              Delete
                            </Button>
                          </div>
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
      {filteredPackages.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">No packages found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory || selectedDestination || statusFilter 
                ? 'Try adjusting your search or filter terms' 
                : 'Get started by adding your first tour package'}
            </p>
            <Link href="/dashboard/packages/new">
              <Button>Add Your First Package</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}