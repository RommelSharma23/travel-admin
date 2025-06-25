// src/app/dashboard/page.tsx
import Link from 'next/link'

const statsCards = [
  {
    title: 'Total Destinations',
    value: '24',
    description: 'Active travel destinations',
    change: '+2 this month',
    icon: '🏝️'
  },
  {
    title: 'Tour Packages',
    value: '156',
    description: 'Available packages',
    change: '+12 this week',
    icon: '📦'
  },
  {
    title: 'Pending Inquiries',
    value: '8',
    description: 'Awaiting response',
    change: '3 urgent',
    icon: '📧'
  },
  {
    title: 'Blog Posts',
    value: '42',
    description: 'Published articles',
    change: '+5 this month',
    icon: '📝'
  }
]

const recentActivity = [
  {
    action: 'New destination added',
    user: 'Super Admin',
    time: '2 hours ago',
    type: 'success'
  },
  {
    action: 'Package updated',
    user: 'Content Manager',
    time: '4 hours ago',
    type: 'info'
  },
  {
    action: 'New inquiry received',
    user: 'System',
    time: '6 hours ago',
    type: 'warning'
  },
  {
    action: 'Blog post published',
    user: 'Super Admin',
    time: '1 day ago',
    type: 'success'
  }
]

const quickActions = [
  {
    icon: '➕',
    title: 'Add New Destination',
    description: 'Create a new travel destination',
    href: '/dashboard/destinations/new'
  },
  {
    icon: '📦',
    title: 'Create Tour Package',
    description: 'Add a new tour package',
    href: '/dashboard/packages/new'
  },
  {
    icon: '📝',
    title: 'Write Blog Post',
    description: 'Create a new blog article',
    href: '/dashboard/blog/new'
  },
  {
    icon: '👥',
    title: 'Manage Inquiries',
    description: 'Review customer inquiries',
    href: '/dashboard/inquiries'
  },
  {
    icon: '🏷️',
    title: 'Manage Categories',
    description: 'Edit travel categories',
    href: '/dashboard/categories'
  },
  {
    icon: '📊',
    title: 'View Analytics',
    description: 'Check website performance',
    href: '/dashboard/analytics'
  },
  {
    icon: '📄',
    title: 'Generate PDF Proposal',
    description: 'Create customer proposals',
    href: '/generate-pdf'
  }
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening with your travel website.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-gray-500">
                  {stat.description}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Latest actions in your admin dashboard
            </p>
            <div className="mt-6 space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.type === 'success' ? 'bg-green-100 text-green-800' :
                    activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Common tasks and shortcuts
            </p>
            <div className="mt-6 space-y-3">
              {quickActions.map((action, index) => (
                <Link 
                  key={index} 
                  href={action.href}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{action.icon}</span>
                      <div>
                        <span className="text-sm font-medium block text-gray-900">{action.title}</span>
                        <span className="text-xs text-gray-500">{action.description}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards for Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/destinations">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <p className="text-sm text-gray-600">Destinations</p>
                </div>
                <span className="text-3xl">🏝️</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Manage travel locations</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/packages">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <p className="text-sm text-gray-600">Packages</p>
                </div>
                <span className="text-3xl">📦</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Tour packages & itineraries</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/inquiries">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">8</div>
                  <p className="text-sm text-gray-600">Inquiries</p>
                </div>
                <span className="text-3xl">📧</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Customer inquiries</p>
            </div>
          </div>
        </Link>

        <Link href="/generate-pdf">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">PDF</div>
                  <p className="text-sm text-gray-600">Generator</p>
                </div>
                <span className="text-3xl">📄</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Create proposals</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg">
        <div className="p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <p className="font-medium text-green-900">
                PDF Generator Added Successfully!
              </p>
              <p className="text-sm text-green-700 mt-1">
                The PDF generation feature is now available in your admin dashboard. You can create customer proposals from scratch or pre-populate with existing package data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}