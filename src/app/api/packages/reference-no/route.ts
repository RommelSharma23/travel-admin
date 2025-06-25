// src/app/api/packages/reference-no/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destinationId = searchParams.get('destination_id')

    if (!destinationId) {
      return NextResponse.json(
        { error: 'destination_id is required' },
        { status: 400 }
      )
    }

    // Get destination info
    const { data: destination, error: destError } = await supabase
      .from('destinations')
      .select('name')
      .eq('id', destinationId)
      .single()

    if (destError || !destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      )
    }

    // Get destination prefix (first 3 letters)
    const prefix = destination.name.slice(0, 3).toUpperCase()

    // Get count of existing packages for this destination
    const { count, error: countError } = await supabase
      .from('tour_packages')
      .select('id', { count: 'exact' })
      .eq('destination_id', destinationId)

    if (countError) {
      console.error('Error counting packages:', countError)
      return NextResponse.json(
        { error: 'Failed to generate reference number' },
        { status: 500 }
      )
    }

    // Generate reference number
    const nextNumber = (count || 0) + 1
    const paddedNumber = nextNumber.toString().padStart(3, '0')
    const referenceNo = `PKG-${prefix}-${paddedNumber}`

    return NextResponse.json({
      success: true,
      reference_no: referenceNo
    })

  } catch (error) {
    console.error('Reference number generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}