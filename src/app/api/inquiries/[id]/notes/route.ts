// src/app/api/inquiries/[id]/notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify inquiry exists
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('id')
      .eq('id', params.id)
      .single()

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    // Get all notes for this inquiry, ordered by most recent first
    const { data: notes, error } = await supabase
      .from('inquiry_notes')
      .select('*')
      .eq('inquiry_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notes', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      notes: notes || [],
      count: notes?.length || 0
    })

  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { note } = body

    // Basic validation
    if (!note || typeof note !== 'string') {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      )
    }

    // Validate note length (2000 characters max)
    const trimmedNote = note.trim()
    if (trimmedNote.length === 0) {
      return NextResponse.json(
        { error: 'Note cannot be empty' },
        { status: 400 }
      )
    }

    if (trimmedNote.length > 2000) {
      return NextResponse.json(
        { error: 'Note cannot exceed 2000 characters' },
        { status: 400 }
      )
    }

    // Verify inquiry exists
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('id')
      .eq('id', params.id)
      .single()

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    // Insert new note
    const insertData = {
      inquiry_id: params.id,
      note: trimmedNote,
      created_by: 'Admin User', // Will be replaced with actual user later
      is_internal: true
    }

    const { data: newNote, error } = await supabase
      .from('inquiry_notes')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return NextResponse.json(
        { error: 'Failed to create note', details: error.message },
        { status: 500 }
      )
    }

    // Update inquiry's updated_at timestamp
    const { error: updateError } = await supabase
      .from('inquiries')
      .update({ 
        updated_at: new Date().toISOString(),
        updated_by: 'Admin User'
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error updating inquiry timestamp:', updateError)
      // Don't fail the whole request if this fails
    }

    return NextResponse.json({
      success: true,
      note: newNote,
      message: 'Note added successfully'
    })

  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}