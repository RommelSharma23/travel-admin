// src/app/api/destinations/route.ts (fixed for your actual table)
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const status = searchParams.get('status')
    const isPublic = searchParams.get('public') === 'true'

    let query = supabase
      .from('destinations')
      .select('*')
      .order('created_at', { ascending: false })

    // If this is for the public website, only show published destinations
    if (isPublic) {
      query = query.eq('status', 'published')
    }

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,country.ilike.%${search}%`)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (status && !isPublic) {
      query = query.eq('status', status)
    }

    const { data: destinations, error } = await query

    if (error) {
      console.error('Error fetching destinations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch destinations', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      destinations: destinations || [],
      count: destinations?.length || 0
    })

  } catch (error) {
    console.error('Destinations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      country,
      description,
      hero_image,
      featured = false,
      status = 'draft'
    } = body

    // Basic validation
    if (!name || !country) {
      return NextResponse.json(
        { error: 'Name and country are required' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const published_at = status === 'published' ? new Date().toISOString() : null

    // Insert data matching your actual table structure
    const insertData = {
      name,
      slug,
      country,
      description,
      hero_image,
      featured, // Note: using 'featured' not 'is_featured'
      status,
      published_at
    }

    const { data: destination, error } = await supabase
      .from('destinations')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating destination:', error)
      return NextResponse.json(
        { error: 'Failed to create destination', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      destination,
      message: `Destination created successfully as ${status}`
    })

  } catch (error) {
    console.error('Create destination error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}