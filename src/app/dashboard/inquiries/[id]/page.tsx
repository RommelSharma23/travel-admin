// src/app/dashboard/inquiries/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface PageProps {
  params: { id: string }
}

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

interface Note {
  id: string
  inquiry_id: string
  note: string
  created_by: string
  created_at: string
  is_internal: boolean
}

export default function InquiryDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(true)
  const [error, setError] = useState('')
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchInquiry()
    fetchNotes()
  }, [params.id])

  const fetchInquiry = async () => {
    try {
      const response = await fetch(`/api/inquiries/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setInquiry(data.inquiry)
      } else {
        setError(data.error || 'Failed to fetch inquiry')
      }
    } catch (error) {
      setError('Network error while fetching inquiry')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/inquiries/${params.id}/notes`)
      const data = await response.json()

      if (response.ok) {
        setNotes(data.notes || [])
      } else {
        console.error('Failed to fetch notes:', data.error)
      }
    } catch (error) {
      console.error('Network error while fetching notes:', error)
    } finally {
      setNotesLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!inquiry) return

    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/inquiries/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        setInquiry(data.inquiry)
        fetchNotes() // Refresh notes to show system note
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update status')
      }
    } catch (error) {
      setError('Network error while updating status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setAddingNote(true)
    try {
      const response = await fetch(`/api/inquiries/${params.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim() })
      })

      if (response.ok) {
        setNewNote('')
        fetchNotes() // Refresh notes list
        if (inquiry) {
          setInquiry({ ...inquiry, notes_count: (inquiry.notes_count || 0) + 1 })
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to add note')
      }
    } catch (error) {
      setError('Network error while adding note')
    } finally {
      setAddingNote(false)
    }
  }

  const handleArchiveToggle = async () => {
    if (!inquiry) return

    try {
      const response = await fetch(`/api/inquiries/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: !inquiry.is_archived })
      })

      if (response.ok) {
        const data = await response.json()
        setInquiry(data.inquiry)
        fetchNotes() // Refresh notes to show system note
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update archive status')
      }
    } catch (error) {
      setError('Network error while updating archive status')
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
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isSystemNote = (note: Note) => note.created_by === 'System'

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Inquiry Details</h1>
          <Link href="/dashboard/inquiries">
            <Button variant="outline">← Back to Inquiries</Button>
          </Link>
        </div>
        <div className="text-center py-8">Loading inquiry...</div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Inquiry Not Found</h1>
          <Link href="/dashboard/inquiries">
            <Button variant="outline">← Back to Inquiries</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">The requested inquiry could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inquiry Details</h1>
          <p className="text-gray-600 mt-2">Manage inquiry and track communication</p>
        </div>
        <Link href="/dashboard/inquiries">
          <Button variant="outline">← Back to Inquiries</Button>
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Inquiry Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Customer Information
                <div className="flex gap-2">
                  <Badge className={`text-xs px-2 py-1 rounded-full ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1).replace('-', ' ')}
                  </Badge>
                  {inquiry.is_archived && (
                    <Badge variant="secondary" className="text-xs">Archived</Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-gray-900">{inquiry.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-gray-900">{inquiry.email}</p>
                </div>
                {inquiry.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Phone</Label>
                    <p className="text-gray-900">{inquiry.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Travel Details */}
          <Card>
            <CardHeader>
              <CardTitle>Travel Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiry.destination && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Destination</Label>
                    <p className="text-gray-900">{inquiry.destination}</p>
                  </div>
                )}
                {inquiry.travel_dates && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Travel Dates</Label>
                    <p className="text-gray-900">{inquiry.travel_dates}</p>
                  </div>
                )}
                {inquiry.group_size && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Group Size</Label>
                    <p className="text-gray-900">{inquiry.group_size} people</p>
                  </div>
                )}
                {inquiry.budget && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Budget</Label>
                    <p className="text-gray-900">{inquiry.budget}</p>
                  </div>
                )}
              </div>

              {inquiry.message && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Message</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{inquiry.message}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Update Status</Label>
                <select
                  id="status"
                  value={inquiry.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updatingStatus}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="quoted">Quoted</option>
                  <option value="follow-up">Follow Up</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleArchiveToggle}
                  className="flex-1"
                >
                  {inquiry.is_archived ? 'Restore Inquiry' : 'Archive Inquiry'}
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Created:</strong> {formatDate(inquiry.created_at)}</p>
                <p><strong>Last Updated:</strong> {formatDate(inquiry.updated_at)}</p>
                {inquiry.updated_by && (
                  <p><strong>Updated By:</strong> {inquiry.updated_by}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Notes Timeline */}
        <div className="space-y-6">
          {/* Add Note Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="space-y-4">
                <div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this inquiry..."
                    rows={4}
                    maxLength={2000}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {newNote.length}/2000 characters
                    </p>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={!newNote.trim() || addingNote || newNote.length > 2000}
                  className="w-full"
                >
                  {addingNote ? 'Adding...' : 'Add Note'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notes Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Notes Timeline
                <Badge variant="outline" className="text-xs">
                  {inquiry.notes_count || 0} notes
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notesLoading ? (
                <div className="text-center py-4 text-gray-500">Loading notes...</div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">📝</div>
                  <p>No notes yet</p>
                  <p className="text-xs">Add the first note above</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        isSystemNote(note)
                          ? 'bg-gray-50 border-l-gray-400'
                          : 'bg-blue-50 border-l-blue-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {isSystemNote(note) ? '⚙️' : '💬'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {note.created_by}
                          </span>
                        </div>
                        <span 
                          className="text-xs text-gray-500" 
                          title={formatDate(note.created_at)}
                        >
                          {getRelativeTime(note.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap ml-7">
                        {note.note}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}