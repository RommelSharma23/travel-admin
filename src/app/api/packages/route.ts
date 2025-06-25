// src/app/api/packages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const destination = searchParams.get('destination')
    const featured = searchParams.get('featured')
    const active = searchParams.get('active')
    const isPublic = searchParams.get('public') === 'true'

    let query = supabase
      .from('tour_packages')
      .select(`
        *,
        destinations (
          id,
          name,
          country
        ),
        categories (
          id,
          name,
          icon,
          color
        )
      `)
      .order('created_at', { ascending: false })

    // If this is for the public website, only show active packages
    if (isPublic) {
      query = query.eq('is_active', true)
    }

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,reference_no.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('category_id', category)
    }

    if (destination) {
      query = query.eq('destination_id', destination)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (active === 'true') {
      query = query.eq('is_active', true)
    } else if (active === 'false') {
      query = query.eq('is_active', false)
    }

    const { data: packages, error } = await query

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch packages', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      packages: packages || [],
      count: packages?.length || 0
    })

  } catch (error) {
    console.error('Packages API error:', error)
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
      title,
      destination_id,
      category_id,
      short_description,
      long_description,
      duration_days,
      duration_nights,
      max_group_size,
      min_age,
      difficulty_level,
      price_from,
      price_to,
      currency,
      availability_status,
      is_featured,
      is_best_selling,
      is_active,
      meta_title,
      meta_description,
      inclusions,
      exclusions,
      highlights,
      keywords,
      itinerary,
      images,
      reference_no
    } = body

    // Basic validation
    if (!title || !destination_id || !duration_days) {
      return NextResponse.json(
        { error: 'Title, destination, and duration are required' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Start transaction
    const { data: packageData, error: packageError } = await supabase
      .from('tour_packages')
      .insert({
        reference_no,
        title,
        slug,
        destination_id,
        category_id,
        short_description,
        long_description,
        duration_days,
        duration_nights,
        max_group_size,
        min_age,
        difficulty_level,
        price_from,
        price_to,
        currency: currency || 'INR',
        availability_status: availability_status || 'Available',
        inclusions: inclusions || [],
        exclusions: exclusions || [],
        highlights: highlights || [],
        is_featured: is_featured || false,
        is_best_selling: is_best_selling || false,
        is_active: is_active !== false, // Default to true
        meta_title,
        meta_description,
        keywords: keywords || []
      })
      .select()
      .single()

    if (packageError) {
      console.error('Error creating package:', packageError)
      return NextResponse.json(
        { error: 'Failed to create package', details: packageError.message },
        { status: 500 }
      )
    }

    const packageId = packageData.id

    // Insert itinerary if provided
    if (itinerary && itinerary.length > 0) {
      const itineraryInserts = itinerary.map((day: any) => ({
        package_id: packageId,
        day_number: day.day_number,
        day_title: day.day_title,
        day_description: day.day_description,
        activities: day.activities,
        sort_order: day.day_number
      }))

      const { error: itineraryError } = await supabase
        .from('package_itinerary')
        .insert(itineraryInserts)

      if (itineraryError) {
        console.error('Error creating itinerary:', itineraryError)
        // Don't fail the entire request, but log the error
      }
    }

    // Insert images if provided
    if (images && images.length > 0) {
      const imageInserts = images.map((image: any, index: number) => ({
        package_id: packageId,
        image_url: image.image_url,
        image_type: image.image_type,
        alt_text: image.alt_text,
        caption: image.caption,
        sort_order: image.sort_order || index,
        day_number: image.day_number,
        is_active: true
      }))

      const { error: imagesError } = await supabase
        .from('package_images')
        .insert(imageInserts)

      if (imagesError) {
        console.error('Error creating images:', imagesError)
        // Don't fail the entire request, but log the error
      }
    }

    return NextResponse.json({
      success: true,
      package: packageData,
      message: 'Package created successfully'
    })

  } catch (error) {
    console.error('Create package error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}