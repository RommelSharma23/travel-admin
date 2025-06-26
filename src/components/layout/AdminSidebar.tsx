// src/components/layout/AdminSidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { adminAuth, type AdminUser } from '@/lib/auth/admin-auth'

interface AdminSidebarProps {
  user?: AdminUser; // Make it optional for backward compatibility
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    permission: null, // Everyone can see dashboard
  },
  {
    title: 'Destinations',
    href: '/dashboard/destinations',
    icon: '🏝️',
    badge: 'New',
    permission: 'destinations:read',
  },
  {
    title: 'Tour Packages',
    href: '/dashboard/packages',
    icon: '📦',
    permission: 'packages:read',
  },
  {
    title: 'Categories',
    href: '/dashboard/categories',
    icon: '🏷️',
    permission: 'categories:read',
  },
  {
    title: 'Blog Posts',
    href: '/dashboard/blog',
    icon: '📝',
    permission: 'blogs:read',
  },
  {
    title: 'Inquiries',
    href: '/dashboard/inquiries',
    icon: '📧',
    dynamicBadge: 'newInquiries',
    permission: 'inquiries:read',
  },
  {
    title: 'Generate PDF',
    href: '/dashboard/generate-pdf',
    icon: '📄',
    permission: 'pdf:generate',
  },
  {
    title: 'Media Library',
    href: '/dashboard/media',
    icon: '🖼️',
    permission: 'media:read',
  },
  {
    title: 'Admin Users',
    href: '/dashboard/users',
    icon: '👥',
    permission: 'super_admin_only', // Special permission for super admin only
  },
]

export function AdminSidebar({ user }: AdminSidebarProps = {}) {
  const pathname = usePathname()
  const [inquiryCount, setInquiryCount] = useState<number>(0)
  const [countLoading, setCountLoading] = useState(true)

  // Use passed user or get current user as fallback
  const currentUser = user || adminAuth.getCurrentUser()

  useEffect(() => {
    // Small delay to not block initial render
    const timer = setTimeout(() => {
      fetchInquiryCount()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const fetchInquiryCount = async () => {
    try {
      const response = await fetch('/api/inquiries?withStats=true&archived=false&status=new')
      const data = await response.json()

      if (response.ok && data.stats) {
        setInquiryCount(data.stats.new || 0)
      } else {
        console.error('Failed to fetch inquiry count:', data.error)
        setInquiryCount(0)
      }
    } catch (error) {
      console.error('Network error while fetching inquiry count:', error)
      setInquiryCount(0)
    } finally {
      setCountLoading(false)
    }
  }

  const getDynamicBadge = (item: typeof navigationItems[0]) => {
    if (item.dynamicBadge === 'newInquiries') {
      // Hide badge while loading or if count is 0
      if (countLoading || inquiryCount === 0) {
        return null
      }
      
      return (
        <Badge variant="destructive" className="text-xs">
          {inquiryCount}
        </Badge>
      )
    }
    return null
  }

  const getStaticBadge = (item: typeof navigationItems[0]) => {
    if (item.badge && !item.dynamicBadge) {
      return (
        <Badge variant={item.badge === 'New' ? 'success' : 'secondary'} className="text-xs">
          {item.badge}
        </Badge>
      )
    }
    return null
  }

  const hasPermission = (item: typeof navigationItems[0]) => {
    if (!currentUser) return false
    
    // No permission required - everyone can see
    if (!item.permission) return true
    
    // Special case for super admin only
    if (item.permission === 'super_admin_only') {
      return currentUser.role === 'super_admin'
    }
    
    // Check regular permissions
    return adminAuth.hasPermission(currentUser, item.permission)
  }

  // Filter navigation items based on permissions
  const visibleItems = navigationItems.filter(hasPermission)

  return (
    <div className="flex h-full w-64 flex-col fixed left-0 top-0 z-40 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          Travel Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <div className="flex items-center">
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.title}
              </div>
              
              {/* Render appropriate badge */}
              {getDynamicBadge(item) || getStaticBadge(item)}
            </Link>
          )
        })}
      </nav>

      {/* Footer - Show user info */}
      <div className="border-t border-gray-200 p-4">
        {currentUser && (
          <div className="mb-3 text-xs">
            <p className="font-medium text-gray-700">
              {currentUser.first_name} {currentUser.last_name}
            </p>
            <p className="text-gray-500 capitalize">
              {currentUser.role.replace('_', ' ')}
            </p>
          </div>
        )}
        <div className="text-xs text-gray-500">
          <p>Travel Admin Dashboard</p>
          <p>v1.0.0 - With Auth</p>
        </div>
      </div>
    </div>
  )
}