// src/app/dashboard/layout.tsx
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminHeader } from '@/components/layout/AdminHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main content area */}
      <div className="ml-64 flex flex-col h-full">
        {/* Header */}
        <AdminHeader />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}