// src/app/api/packages/[id]/route.ts - UPDATED WITH PUT METHOD
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: package_data, error } = await supabase
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
      .eq('id', params.id)
      .single()

    if (error || !package_data) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Fetch itinerary
    const { data: itinerary } = await supabase
      .from('package_itinerary')
      .select('*')
      .eq('package_id', params.id)
      .order('sort_order', { ascending: true })

    // Fetch images
    const { data: images } = await supabase
      .from('package_images')
      .select('*')
      .eq('package_id', params.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    return NextResponse.json({
      success: true,
      package: {
        ...package_data,
        itinerary: itinerary || [],
        images: images || []
      }
    })

  } catch (error) {
    console.error('Get package error:', error)
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

    const { data: package_data, error } = await supabase
      .from('tour_packages')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating package:', error)
      return NextResponse.json(
        { error: 'Failed to update package', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      package: package_data,
      message: 'Package updated successfully'
    })

  } catch (error) {
    console.error('Update package error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// NEW PUT METHOD - Full update for edit page
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
      images
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

    // Start transaction by updating main package
    const { data: packageData, error: packageError } = await supabase
      .from('tour_packages')
      .update({
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
        is_active: is_active !== false,
        meta_title,
        meta_description,
        keywords: keywords || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (packageError) {
      console.error('Error updating package:', packageError)
      return NextResponse.json(
        { error: 'Failed to update package', details: packageError.message },
        { status: 500 }
      )
    }

    const packageId = params.id

    // Update itinerary - Delete existing and insert new
    if (itinerary && itinerary.length > 0) {
      // Delete existing itinerary
      const { error: deleteItineraryError } = await supabase
        .from('package_itinerary')
        .delete()
        .eq('package_id', packageId)

      if (deleteItineraryError) {
        console.error('Error deleting existing itinerary:', deleteItineraryError)
      }

      // Insert new itinerary
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
        console.error('Error updating itinerary:', itineraryError)
      }
    }

 // Update images - Delete existing and insert new
if (images && images.length > 0) {
  // Delete existing images
  const { error: deleteImagesError } = await supabase
    .from('package_images')
    .delete()
    .eq('package_id', packageId)

  if (deleteImagesError) {
    console.error('Error deleting existing images:', deleteImagesError)
  }

  // Prepare images for insertion
  const imageInserts = []
  
  // ✅ FIXED: Process all images from the request with null checks
  for (const image of images) {
    // ✅ Skip null/undefined images or images without URL
    if (!image || !image.image_url) {
      console.warn('Skipping invalid image:', image)
      continue
    }

    imageInserts.push({
      package_id: packageId,
      image_url: image.image_url,
      image_type: image.image_type || 'gallery',
      alt_text: image.alt_text || '',
      caption: image.caption || '',
      sort_order: image.sort_order || 0,
      day_number: image.day_number || null,
      is_active: true
    })
  }

 // ✅ FIXED: Also process images from itinerary days with null checks
if (itinerary) {
  itinerary.forEach((day: any) => {
    if (day.images && day.images.length > 0) {
      day.images.forEach((dayImage: any, index: number) => {
        // ✅ Skip null/undefined images or images without URL
        if (!dayImage || !dayImage.image_url) {
          console.warn('Skipping invalid itinerary image:', dayImage)
          return
        }

        imageInserts.push({
          package_id: packageId,
          image_url: dayImage.image_url,
          image_type: 'itinerary',
          alt_text: dayImage.alt_text || `Day ${day.day_number} image`,
          caption: dayImage.caption || '',
          sort_order: index,
          day_number: day.day_number,
          is_active: true
        })
      })
    }
  })
}

      // Insert new images
      if (imageInserts.length > 0) {
        const { error: imagesError } = await supabase
          .from('package_images')
          .insert(imageInserts)

        if (imagesError) {
          console.error('Error updating images:', imagesError)
        }
      }
    }

    // Fetch updated package with relations
    const { data: updatedPackage, error: fetchError } = await supabase
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
      .eq('id', packageId)
      .single()

    if (fetchError) {
      console.error('Error fetching updated package:', fetchError)
    }

    return NextResponse.json({
      success: true,
      package: updatedPackage || packageData,
      message: 'Package updated successfully'
    })

  } catch (error) {
    console.error('Full update package error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Delete related records first
    await supabase.from('package_itinerary').delete().eq('package_id', params.id)
    await supabase.from('package_images').delete().eq('package_id', params.id)

    // Delete the package
    const { error } = await supabase
      .from('tour_packages')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting package:', error)
      return NextResponse.json(
        { error: 'Failed to delete package', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully'
    })

  } catch (error) {
    console.error('Delete package error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}