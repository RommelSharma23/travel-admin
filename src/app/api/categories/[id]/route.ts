// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Get destination count for this category
    const { count: destinationCount, error: countError } = await supabase
      .from('destinations')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', params.id)

    if (countError) {
      console.error('Error counting destinations:', countError)
    }

    const categoryWithUsage = {
      ...category,
      destination_count: destinationCount || 0
    }

    return NextResponse.json({
      success: true,
      category: categoryWithUsage
    })

  } catch (error) {
    console.error('Get category error:', error)
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

    // If name is being updated, regenerate slug
    if (updateData.name && typeof updateData.name === 'string') {
      const newSlug = updateData.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Check if new slug conflicts with existing categories (excluding current one)
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', params.id)
        .single()

      if (existingCategory) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        )
      }

      updateData.slug = newSlug
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return NextResponse.json(
        { error: 'Failed to update category', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      category,
      message: 'Category updated successfully'
    })

  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const reassignToCategoryId = searchParams.get('reassignTo')

    // First check if category has any destinations assigned
    const { data: assignedDestinations, error: checkError } = await supabase
      .from('destinations')
      .select('id, name')
      .eq('category_id', params.id)

    if (checkError) {
      console.error('Error checking assigned destinations:', checkError)
      return NextResponse.json(
        { error: 'Failed to check category usage', details: checkError.message },
        { status: 500 }
      )
    }

    // If category has destinations and no reassignment specified, return error with details
    if (assignedDestinations && assignedDestinations.length > 0 && !reassignToCategoryId) {
      return NextResponse.json(
        { 
          error: 'Category is in use and cannot be deleted',
          canReassign: true,
          assignedDestinations: assignedDestinations,
          destinationCount: assignedDestinations.length
        },
        { status: 400 }
      )
    }

    // If reassignment is specified, update all destinations
    if (assignedDestinations && assignedDestinations.length > 0 && reassignToCategoryId) {
      // Validate that the reassignment category exists and is active
      const { data: targetCategory, error: targetError } = await supabase
        .from('categories')
        .select('id, name, is_active')
        .eq('id', reassignToCategoryId)
        .single()

      if (targetError || !targetCategory) {
        return NextResponse.json(
          { error: 'Target category for reassignment not found' },
          { status: 400 }
        )
      }

      if (!targetCategory.is_active) {
        return NextResponse.json(
          { error: 'Cannot reassign to an inactive category' },
          { status: 400 }
        )
      }

      // Update all destinations to new category
      const { error: reassignError } = await supabase
        .from('destinations')
        .update({ 
          category_id: parseInt(reassignToCategoryId),
          updated_at: new Date().toISOString()
        })
        .eq('category_id', params.id)

      if (reassignError) {
        console.error('Error reassigning destinations:', reassignError)
        return NextResponse.json(
          { error: 'Failed to reassign destinations', details: reassignError.message },
          { status: 500 }
        )
      }
    }

    // If no destinations or if reassignment was specified and "none", unassign all destinations
    if (reassignToCategoryId === 'none' && assignedDestinations && assignedDestinations.length > 0) {
      const { error: unassignError } = await supabase
        .from('destinations')
        .update({ 
          category_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('category_id', params.id)

      if (unassignError) {
        console.error('Error unassigning destinations:', unassignError)
        return NextResponse.json(
          { error: 'Failed to unassign destinations', details: unassignError.message },
          { status: 500 }
        )
      }
    }

    // Now delete the category
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting category:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete category', details: deleteError.message },
        { status: 500 }
      )
    }

    let message = 'Category deleted successfully'
    if (reassignToCategoryId && reassignToCategoryId !== 'none') {
      message += ` and ${assignedDestinations?.length || 0} destinations reassigned`
    } else if (reassignToCategoryId === 'none') {
      message += ` and ${assignedDestinations?.length || 0} destinations unassigned`
    }

    return NextResponse.json({
      success: true,
      message,
      reassignedCount: assignedDestinations?.length || 0
    })

  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}