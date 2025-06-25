// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword, generateSessionToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('Login attempt:', { email, password: '***' })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    // Find admin user by email
    const { data: adminUser, error: userError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, password_hash, first_name, last_name, role, is_active')
      .eq('email', email)
      .single()

    console.log('Database query result:', { 
      found: !!adminUser, 
      error: userError?.message,
      userEmail: adminUser?.email,
      isActive: adminUser?.is_active 
    })

    if (userError || !adminUser) {
      // Let's also try to see all users for debugging
      const { data: allUsers } = await supabaseAdmin
        .from('admin_users')
        .select('email')
      
      console.log('All admin users in database:', allUsers)
      
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          debug: `User not found. Available emails: ${allUsers?.map(u => u.email).join(', ')}`
        },
        { status: 401 }
      )
    }

    if (!adminUser.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 401 }
      )
    }

    // Debug password verification
    console.log('Password verification:', {
      provided: password,
      stored: adminUser.password_hash.substring(0, 20) + '...'
    })

    // Verify password
    const isPasswordValid = await verifyPassword(password, adminUser.password_hash)
    console.log('Password valid:', isPasswordValid)

    if (!isPasswordValid) {
      // For debugging, let's try the raw password comparison too
      const directMatch = password === 'admin123'
      console.log('Direct password match test:', directMatch)
      
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          debug: `Password verification failed. Hash starts with: ${adminUser.password_hash.substring(0, 10)}`
        },
        { status: 401 }
      )
    }

    // Generate session token
    const sessionToken = await generateSessionToken()

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id)

    // Log activity
    await supabaseAdmin
      .from('admin_activity_log')
      .insert({
        admin_user_id: adminUser.id,
        action: 'login',
        ip_address: request.ip || 'unknown'
      })

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        first_name: adminUser.first_name,
        last_name: adminUser.last_name,
        role: adminUser.role
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error', debug: error },
      { status: 500 }
    )
  }
}