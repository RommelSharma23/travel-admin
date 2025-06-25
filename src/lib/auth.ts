// src/lib/auth.ts
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'
import { cookies } from 'next/headers'

export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'super_admin' | 'content_manager'
  is_active: boolean
  last_login: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateSessionToken(): Promise<string> {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Get current admin user from session
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return null
    }

    // For now, we'll decode the session token and get user
    // In a real app, you'd store sessions in a database
    // This is a simplified approach for demo purposes
    
    // We'll get user by checking if session token exists (simplified)
    // In production, you'd have a sessions table
    
    return null // Will be implemented when we add session storage
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Basic auth helpers
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getDisplayName(user: AdminUser): string {
  return `${user.first_name} ${user.last_name}`
}

// Check if user has permission
export function hasPermission(user: AdminUser, action: string): boolean {
  if (user.role === 'super_admin') {
    return true // Super admin can do everything
  }
  
  // Content managers have limited permissions
  const contentManagerPermissions = [
    'read_destinations',
    'create_destinations',
    'update_destinations',
    'read_packages',
    'create_packages',
    'update_packages',
    'read_blog',
    'create_blog',
    'update_blog',
    'read_inquiries',
    'update_inquiries'
  ]
  
  return contentManagerPermissions.includes(action)
}