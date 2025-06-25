// src/components/layout/AdminSidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    title: 'Destinations',
    href: '/dashboard/destinations',
    icon: '🏝️',
    badge: 'New'
  },
  {
    title: 'Tour Packages',
    href: '/dashboard/packages',
    icon: '📦',
  },
  {
    title: 'Categories',
    href: '/dashboard/categories',
    icon: '🏷️',
  },
  {
    title: 'Blog Posts',
    href: '/dashboard/blog',
    icon: '📝',
  },
  {
    title: 'Inquiries',
    href: '/dashboard/inquiries',
    icon: '📧',
    dynamicBadge: 'newInquiries'
  },
  {
    title: 'Media Library',
    href: '/dashboard/media',
    icon: '🖼️',
  },
  {
    title: 'Admin Users',
    href: '/dashboard/users',
    icon: '👥',
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [inquiryCount, setInquiryCount] = useState<number>(0)
  const [countLoading, setCountLoading] = useState(true)

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
        {navigationItems.map((item) => {
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

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500">
          <p>Travel Admin Dashboard</p>
          <p>v1.0.0 - Step 10</p>
        </div>
      </div>
    </div>
  )
}