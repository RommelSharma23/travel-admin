// src/components/layout/AdminHeader.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function AdminHeader() {
  const router = useRouter()

  // Mock user data for now
  const currentUser = {
    name: 'Super Admin',
    email: 'admin@yoursite.com',
    role: 'super_admin'
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 ml-64">
      {/* Left side - Page title will be dynamic */}
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Dashboard
        </h2>
      </div>

      {/* Right side - User info and actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <span className="text-lg">🔔</span>
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
            3
          </Badge>
        </Button>

        {/* User info */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500">
              {currentUser.role.replace('_', ' ')}
            </p>
          </div>
          
          {/* User avatar */}
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              SA
            </span>
          </div>

          {/* Logout button */}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}