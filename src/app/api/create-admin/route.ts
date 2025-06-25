// src/app/api/create-admin/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Generate a proper bcrypt hash for 'admin123'
    const properHash = await hashPassword('admin123')
    
    console.log('Generated hash:', properHash)

    // Delete existing admin user with this email
    await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('email', 'admin@yoursite.com')

    // Create new admin user with correct hash
    const { data: newUser, error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: 'admin@yoursite.com',
        password_hash: properHash,
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin',
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully with correct password hash',
      user: {
        id: newUser.id,
        email: newUser.email,
        hash_preview: properHash.substring(0, 20) + '...'
      }
    })

  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}