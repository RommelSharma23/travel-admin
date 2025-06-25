// src/app/api/inquiries/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const archived = searchParams.get('archived') || 'false'
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const withStats = searchParams.get('withStats') === 'true'

    let query = supabase
      .from('inquiries')
      .select('*, inquiry_notes(count)')
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,destination.ilike.%${search}%,message.ilike.%${search}%`)
    }

    if (status) {
      const statusList = status.split(',')
      query = query.in('status', statusList)
    }

    if (archived === 'true') {
      query = query.eq('is_archived', true)
    } else if (archived === 'false') {
      query = query.eq('is_archived', false)
    }

    if (from) {
      query = query.gte('created_at', from)
    }

    if (to) {
      query = query.lte('created_at', to + 'T23:59:59.999Z')
    }

    const { data: inquiries, error } = await query

    if (error) {
      console.error('Error fetching inquiries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch inquiries', details: error.message },
        { status: 500 }
      )
    }

    let stats = null
    if (withStats) {
      // Calculate quick stats for dashboard
      const { data: allInquiries, error: statsError } = await supabase
        .from('inquiries')
        .select('status, is_archived')
        .eq('is_archived', false)

      if (!statsError && allInquiries) {
        const total = allInquiries.length
        const newCount = allInquiries.filter(i => i.status === 'new').length
        const pending = allInquiries.filter(i => 
          ['in-progress', 'quoted', 'follow-up'].includes(i.status)
        ).length
        const converted = allInquiries.filter(i => i.status === 'converted').length
        const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0

        stats = {
          total,
          new: newCount,
          pending,
          converted,
          conversionRate
        }
      }
    }

    // Add notes count to each inquiry
    const inquiriesWithNotesCount = inquiries?.map(inquiry => ({
      ...inquiry,
      notes_count: inquiry.inquiry_notes?.[0]?.count || 0
    })) || []

    return NextResponse.json({
      success: true,
      inquiries: inquiriesWithNotesCount,
      count: inquiriesWithNotesCount.length,
      stats
    })

  } catch (error) {
    console.error('Inquiries API error:', error)
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
      email,
      phone,
      destination,
      travel_dates,
      group_size,
      budget,
      message,
      status = 'new'
    } = body

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Status validation
    const validStatuses = ['new', 'in-progress', 'quoted', 'follow-up', 'converted', 'closed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Insert new inquiry
    const insertData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      destination: destination?.trim() || null,
      travel_dates: travel_dates?.trim() || null,
      group_size: group_size || null,
      budget: budget?.trim() || null,
      message: message?.trim() || null,
      status,
      updated_by: 'Admin User',
      is_archived: false
    }

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating inquiry:', error)
      return NextResponse.json(
        { error: 'Failed to create inquiry', details: error.message },
        { status: 500 }
      )
    }

    // Create initial system note
    const { error: noteError } = await supabase
      .from('inquiry_notes')
      .insert({
        inquiry_id: inquiry.id,
        note: 'Inquiry created',
        created_by: 'System',
        is_internal: true
      })

    if (noteError) {
      console.error('Error creating initial note:', noteError)
      // Don't fail the whole request if note creation fails
    }

    return NextResponse.json({
      success: true,
      inquiry,
      message: 'Inquiry created successfully'
    })

  } catch (error) {
    console.error('Create inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}