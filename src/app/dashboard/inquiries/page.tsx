// src/app/dashboard/inquiries/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  destination: string | null
  travel_dates: string | null
  group_size: number | null
  budget: string | null
  message: string | null
  status: string
  created_at: string
  updated_at: string
  updated_by: string | null
  assigned_to: string | null
  is_archived: boolean
  notes_count?: number
}

interface Stats {
  total: number
  new: number
  pending: number
  converted: number
  conversionRate: number
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const params = new URLSearchParams({
        withStats: 'true',
        archived: showArchived.toString()
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)

      const response = await fetch(`/api/inquiries?${params}`)
      const data = await response.json()

      if (response.ok) {
        setInquiries(data.inquiries || [])
        setStats(data.stats)
      } else {
        setError(data.error || 'Failed to fetch inquiries')
      }
    } catch (error) {
      setError('Network error while fetching inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchInquiries()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
    setShowArchived(false)
    setLoading(true)
    // Fetch will be triggered by useEffect due to state changes
    setTimeout(fetchInquiries, 100)
  }

  const toggleArchiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: !currentStatus })
      })

      if (response.ok) {
        setInquiries(inquiries.map(inquiry => 
          inquiry.id === id ? { ...inquiry, is_archived: !currentStatus } : inquiry
        ))
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update inquiry status')
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error)
      setError('Network error while updating inquiry')
    }
  }

  const updateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setInquiries(inquiries.map(inquiry => 
          inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry
        ))
        // Refresh stats
        fetchInquiries()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update inquiry status')
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error)
      setError('Network error while updating inquiry')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'quoted': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'follow-up': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'converted': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredInquiries = inquiries

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Inquiries</h1>
        </div>
        <div className="text-center py-8">Loading inquiries...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-600 mt-2">Manage customer inquiries and track conversions</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Inquiries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <p className="text-xs text-muted-foreground">New</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
              <p className="text-xs text-muted-foreground">Converted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Search name, email, destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="quoted">Quoted</option>
              <option value="follow-up">Follow Up</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>

            <Input
              type="date"
              placeholder="From date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <Input
              type="date"
              placeholder="To date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={handleSearch}>
                🔍 Search
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="show_archived"
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="show_archived" className="text-sm">Show Archived</label>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter || dateFrom || dateTo || showArchived) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('')} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {dateFrom && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  From: {dateFrom}
                  <button onClick={() => setDateFrom('')} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {dateTo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  To: {dateTo}
                  <button onClick={() => setDateTo('')} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {showArchived && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Showing Archived
                  <button onClick={() => setShowArchived(false)} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Inquiries Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Travel Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                        <div className="text-sm text-gray-500">{inquiry.email}</div>
                        {inquiry.phone && (
                          <div className="text-xs text-gray-400">{inquiry.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {inquiry.destination && (
                          <div><strong>Destination:</strong> {inquiry.destination}</div>
                        )}
                        {inquiry.travel_dates && (
                          <div><strong>Dates:</strong> {inquiry.travel_dates}</div>
                        )}
                        {inquiry.group_size && (
                          <div><strong>Group:</strong> {inquiry.group_size} people</div>
                        )}
                        {inquiry.budget && (
                          <div><strong>Budget:</strong> {inquiry.budget}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={inquiry.status}
                        onChange={(e) => updateInquiryStatus(inquiry.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(inquiry.status)}`}
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="quoted">Quoted</option>
                        <option value="follow-up">Follow Up</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                      </select>
                      {inquiry.is_archived && (
                        <Badge variant="secondary" className="mt-1 text-xs">Archived</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        💬 {inquiry.notes_count || 0}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inquiry.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/dashboard/inquiries/${inquiry.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleArchiveStatus(inquiry.id, inquiry.is_archived)}
                      >
                        {inquiry.is_archived ? 'Restore' : 'Archive'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredInquiries.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-lg font-semibold mb-2">No inquiries found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter || dateFrom || dateTo 
                ? 'Try adjusting your search or filter terms' 
                : 'New customer inquiries will appear here'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}