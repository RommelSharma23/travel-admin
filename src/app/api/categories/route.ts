// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const active = searchParams.get('active')
    const withUsageCount = searchParams.get('withUsageCount') === 'true'

    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (active === 'true') {
      query = query.eq('is_active', true)
    } else if (active === 'false') {
      query = query.eq('is_active', false)
    }

    const { data: categories, error } = await query

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      )
    }

    // Get usage count for each category if requested
    let categoriesWithUsage = categories || []
    
    if (withUsageCount && categories && categories.length > 0) {
      const usageCounts = await Promise.all(
        categories.map(async (category) => {
          const { count, error: countError } = await supabase
            .from('destinations')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)

          if (countError) {
            console.error(`Error counting destinations for category ${category.id}:`, countError)
            return { ...category, destination_count: 0 }
          }

          return { ...category, destination_count: count || 0 }
        })
      )
      
      categoriesWithUsage = usageCounts
    }

    return NextResponse.json({
      success: true,
      categories: categoriesWithUsage,
      count: categoriesWithUsage.length
    })

  } catch (error) {
    console.error('Categories API error:', error)
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
      description,
      icon,
      image_url,
      color,
      is_active = true
    } = body

    // Basic validation
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check if slug already exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    // Get next sort order
    const { data: lastCategory } = await supabase
      .from('categories')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const sort_order = lastCategory ? (lastCategory.sort_order || 0) + 1 : 1

    // Insert new category
    const insertData = {
      name,
      slug,
      description,
      icon,
      image_url,
      color: color || '#6366F1',
      is_active,
      sort_order
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json(
        { error: 'Failed to create category', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      category,
      message: 'Category created successfully'
    })

  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}