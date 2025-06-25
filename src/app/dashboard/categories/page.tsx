// src/app/dashboard/categories/page.tsx
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
  slug: string
  description: string | null
  icon: string | null
  image_url: string | null
  color: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  destination_count?: number
}

interface DeleteModalData {
  category: Category
  assignedDestinations: any[]
  availableCategories: Category[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteModalData, setDeleteModalData] = useState<DeleteModalData | null>(null)
  const [reassignToCategoryId, setReassignToCategoryId] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?withUsageCount=true')
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories || [])
      } else {
        setError(data.error || 'Failed to fetch categories')
      }
    } catch (error) {
      setError('Network error while fetching categories')
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && category.is_active) ||
                         (statusFilter === 'inactive' && !category.is_active)
    
    return matchesSearch && matchesStatus
  })

  const toggleActiveStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (response.ok) {
        setCategories(categories.map(cat => 
          cat.id === id ? { ...cat, is_active: !currentStatus } : cat
        ))
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update category status')
      }
    } catch (error) {
      console.error('Error updating category status:', error)
      setError('Network error while updating category')
    }
  }

  const handleDeleteClick = async (category: Category) => {
    if (category.destination_count === 0) {
      // Direct delete if no destinations assigned
      if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
        await performDelete(category.id)
      }
      return
    }

    // Category has destinations, show reassignment modal
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (!response.ok && data.canReassign) {
        // Get available categories for reassignment (excluding current category)
        const availableCategories = categories.filter(cat => 
          cat.id !== category.id && cat.is_active
        )
        
        setDeleteModalData({
          category,
          assignedDestinations: data.assignedDestinations || [],
          availableCategories
        })
        setReassignToCategoryId('')
        setShowDeleteModal(true)
      }
    } catch (error) {
      console.error('Error checking category deletion:', error)
      setError('Error checking category deletion')
    }
  }

  const performDelete = async (categoryId: number, reassignTo?: string) => {
    try {
      setDeleteLoading(true)
      
      let url = `/api/categories/${categoryId}`
      if (reassignTo) {
        url += `?reassignTo=${reassignTo}`
      }
      
      const response = await fetch(url, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        // Remove category from list
        setCategories(categories.filter(cat => cat.id !== categoryId))
        setShowDeleteModal(false)
        setDeleteModalData(null)
        
        // Show success message if there were reassignments
        if (data.reassignedCount > 0) {
          alert(`Category deleted successfully. ${data.reassignedCount} destinations were ${reassignTo === 'none' ? 'unassigned' : 'reassigned'}.`)
        }
      } else {
        setError(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      setError('Network error while deleting category')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleConfirmDelete = () => {
    if (deleteModalData) {
      performDelete(deleteModalData.category.id, reassignToCategoryId || 'none')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Categories</h1>
        </div>
        <div className="text-center py-8">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">Manage travel categories and themes</p>
        </div>
        <Link href="/dashboard/categories/new">
          <Button>
            <span className="mr-2">➕</span>
            Add Category
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Total Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {categories.filter(c => c.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {categories.filter(c => !c.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + (cat.destination_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Destinations</p>
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
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full md:w-auto md:min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
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
          {(searchTerm || statusFilter) && (
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
              {statusFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <button 
                    onClick={() => setStatusFilter('')}
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
          <button 
            onClick={() => setError('')}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-4xl"
                    style={{ backgroundColor: category.color + '20' || '#6366F120' }}
                  >
                    {category.icon || '📂'}
                  </div>
                )}
                <div className="absolute top-2 right-2 space-y-1">
                  <Badge 
                    variant={category.is_active ? 'success' : 'secondary'} 
                    className="text-xs"
                  >
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur-sm">
                    #{category.sort_order}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight flex items-center gap-2">
                  {category.icon && <span>{category.icon}</span>}
                  {category.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {category.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: category.color || '#6366F1',
                      color: category.color || '#6366F1'
                    }}
                  >
                    {category.destination_count || 0} destinations
                  </Badge>
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: category.color || '#6366F1' }}
                    title={category.color || '#6366F1'}
                  ></div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/categories/edit/${category.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        ✏️ Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActiveStatus(category.id, category.is_active)}
                      className="flex-1"
                    >
                      {category.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(category)}
                    className="w-full"
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {category.image_url ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={category.image_url}
                                alt={category.name}
                              />
                            ) : (
                              <div 
                                className="h-12 w-12 rounded-lg flex items-center justify-center text-xl"
                                style={{ backgroundColor: category.color + '20' || '#6366F120' }}
                              >
                                {category.icon || '📂'}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {category.icon && <span>{category.icon}</span>}
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {category.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                          {category.description || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: category.color || '#6366F1',
                            color: category.color || '#6366F1'
                          }}
                        >
                          {category.destination_count || 0} destinations
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={category.is_active ? 'success' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{category.sort_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link href={`/dashboard/categories/edit/${category.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActiveStatus(category.id, category.is_active)}
                        >
                          {category.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(category)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredCategories.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-lg font-semibold mb-2">No categories found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter ? 'Try adjusting your search or filter terms' : 'Get started by adding your first category'}
            </p>
            <Link href="/dashboard/categories/new">
              <Button>Add Your First Category</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Delete Category
                </h2>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  The category <strong>"{deleteModalData.category.name}"</strong> is currently assigned to{' '}
                  <strong>{deleteModalData.assignedDestinations.length}</strong> destination(s):
                </p>
                
                <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                  {deleteModalData.assignedDestinations.map((dest, index) => (
                    <div key={dest.id} className="text-sm text-gray-600">
                      • {dest.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What should happen to these destinations?
                </label>
                
                <select
                  value={reassignToCategoryId}
                  onChange={(e) => setReassignToCategoryId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="none">Remove category assignment (no category)</option>
                  {deleteModalData.availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      Reassign to: {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. The category will be permanently deleted.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Category'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}