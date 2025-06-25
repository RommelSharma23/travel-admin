// src/app/api/destinations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: destination, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      destination
    })

  } catch (error) {
    console.error('Get destination error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    
    // Remove undefined values and prepare update data
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined)
    )

    // Handle status change
    if (updateData.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString()
    } else if (updateData.status === 'draft') {
      updateData.published_at = null
    }

    const { data: destination, error } = await supabase
      .from('destinations')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating destination:', error)
      return NextResponse.json(
        { error: 'Failed to update destination', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      destination,
      message: 'Destination updated successfully'
    })

  } catch (error) {
    console.error('Update destination error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting destination:', error)
      return NextResponse.json(
        { error: 'Failed to delete destination', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Destination deleted successfully'
    })

  } catch (error) {
    console.error('Delete destination error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}