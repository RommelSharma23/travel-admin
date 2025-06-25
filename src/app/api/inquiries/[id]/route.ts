// src/app/api/inquiries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    // Get notes count for this inquiry
    const { count: notesCount, error: countError } = await supabase
      .from('inquiry_notes')
      .select('*', { count: 'exact', head: true })
      .eq('inquiry_id', params.id)

    if (countError) {
      console.error('Error counting notes:', countError)
    }

    const inquiryWithNotesCount = {
      ...inquiry,
      notes_count: notesCount || 0
    }

    return NextResponse.json({
      success: true,
      inquiry: inquiryWithNotesCount
    })

  } catch (error) {
    console.error('Get inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    
    // Get current inquiry for comparison
    const { data: currentInquiry, error: fetchError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentInquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    // Remove undefined values and prepare update data
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined)
    )

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['new', 'in-progress', 'quoted', 'follow-up', 'converted', 'closed']
      if (typeof updateData.status !== 'string' || !validStatuses.includes(updateData.status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        )
      }
    }

    // Add updated timestamp and user
    updateData.updated_at = new Date().toISOString()
    updateData.updated_by = 'Admin User'

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating inquiry:', error)
      return NextResponse.json(
        { error: 'Failed to update inquiry', details: error.message },
        { status: 500 }
      )
    }

    // Create system notes for significant changes
    const notes = []

    // Status change note
    if (updateData.status && updateData.status !== currentInquiry.status) {
      notes.push({
        inquiry_id: params.id,
        note: `Status changed from '${currentInquiry.status}' to '${updateData.status}'`,
        created_by: 'System',
        is_internal: true
      })
    }

    // Assignment change note
    if ('assigned_to' in updateData && updateData.assigned_to !== currentInquiry.assigned_to) {
      const newAssignee = updateData.assigned_to as string | null
      const oldAssignee = currentInquiry.assigned_to as string | null
      
      if (newAssignee && oldAssignee) {
        notes.push({
          inquiry_id: params.id,
          note: `Reassigned from '${oldAssignee}' to '${newAssignee}'`,
          created_by: 'System',
          is_internal: true
        })
      } else if (newAssignee) {
        notes.push({
          inquiry_id: params.id,
          note: `Assigned to '${newAssignee}'`,
          created_by: 'System',
          is_internal: true
        })
      } else if (oldAssignee) {
        notes.push({
          inquiry_id: params.id,
          note: `Unassigned from '${oldAssignee}'`,
          created_by: 'System',
          is_internal: true
        })
      }
    }

    // Archive note
    if ('is_archived' in updateData && updateData.is_archived !== currentInquiry.is_archived) {
      const isArchived = updateData.is_archived as boolean
      notes.push({
        inquiry_id: params.id,
        note: isArchived ? 'Inquiry archived' : 'Inquiry restored',
        created_by: 'System',
        is_internal: true
      })
    }

    // Insert all system notes
    if (notes.length > 0) {
      const { error: notesError } = await supabase
        .from('inquiry_notes')
        .insert(notes)

      if (notesError) {
        console.error('Error creating system notes:', notesError)
        // Don't fail the whole request if notes creation fails
      }
    }

    return NextResponse.json({
      success: true,
      inquiry,
      message: 'Inquiry updated successfully'
    })

  } catch (error) {
    console.error('Update inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    if (hardDelete) {
      // Hard delete - completely remove from database
      const { error: deleteError } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', params.id)

      if (deleteError) {
        console.error('Error deleting inquiry:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete inquiry', details: deleteError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Inquiry permanently deleted'
      })
    } else {
      // Soft delete - mark as archived
      const { data: inquiry, error } = await supabase
        .from('inquiries')
        .update({ 
          is_archived: true,
          updated_at: new Date().toISOString(),
          updated_by: 'Admin User'
        })
        .eq('id', params.id)
        .select()
        .single()

      if (error) {
        console.error('Error archiving inquiry:', error)
        return NextResponse.json(
          { error: 'Failed to archive inquiry', details: error.message },
          { status: 500 }
        )
      }

      // Create system note for archiving
      const { error: noteError } = await supabase
        .from('inquiry_notes')
        .insert({
          inquiry_id: params.id,
          note: 'Inquiry archived',
          created_by: 'System',
          is_internal: true
        })

      if (noteError) {
        console.error('Error creating archive note:', noteError)
        // Don't fail the whole request if note creation fails
      }

      return NextResponse.json({
        success: true,
        inquiry,
        message: 'Inquiry archived successfully'
      })
    }

  } catch (error) {
    console.error('Delete inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}