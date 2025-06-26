// src/components/layout/AdminHeader.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { adminAuth, type AdminUser } from '@/lib/auth/admin-auth'

interface AdminHeaderProps {
  user?: AdminUser; // Make it optional for backward compatibility
}

export function AdminHeader({ user }: AdminHeaderProps = {}) {
  const router = useRouter()

  // Use passed user or get current user as fallback
  const currentUser = user || adminAuth.getCurrentUser()

  const handleLogout = () => {
    adminAuth.logout()
    router.push('/login')
  }

  // If no user, show fallback
  if (!currentUser) {
    return (
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 ml-64">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        </div>
        <div>Loading...</div>
      </header>
    )
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
              {currentUser.first_name} {currentUser.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {currentUser.role.replace('_', ' ')}
            </p>
          </div>
          
          {/* User avatar */}
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
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