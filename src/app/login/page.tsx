// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@yoursite.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adminUsers, setAdminUsers] = useState<any>(null)
  const [loginResult, setLoginResult] = useState<any>(null)
  const [createResult, setCreateResult] = useState<any>(null)
  const router = useRouter()

  const testAdminUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-admin')
      const result = await response.json()
      setAdminUsers(result)
    } catch (error) {
      setAdminUsers({ success: false, error: 'Network error' })
    }
    setLoading(false)
  }

  const createCorrectAdmin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-admin', {
        method: 'POST'
      })
      const result = await response.json()
      setCreateResult(result)
      
      // Refresh admin users list after creating
      if (result.success) {
        setTimeout(() => testAdminUsers(), 1000)
      }
    } catch (error) {
      setCreateResult({ success: false, error: 'Network error' })
    }
    setLoading(false)
  }

  const testLoginAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@yoursite.com',
          password: 'admin123'
        })
      })
      
      const result = await response.json()
      setLoginResult({
        status: response.status,
        ...result
      })
    } catch (error) {
      setLoginResult({ success: false, error: 'Network error' })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Login successful
        router.push('/dashboard')
        router.refresh() // Refresh to update auth state
      } else {
        setError(data.error || 'Login failed')
        if (data.debug) {
          console.log('Debug info:', data.debug)
        }
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Travel Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your admin account
          </p>
        </div>

        {/* Fix Section */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">🔧 Fix: Create Admin with Correct Password</CardTitle>
            <CardDescription className="text-green-700">
              The password hash in your database is incorrect. Click to create a new admin user with the proper bcrypt hash.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={createCorrectAdmin} disabled={loading} className="w-full mb-2">
              Create Admin User (Correct Hash)
            </Button>
            
            {createResult && (
              <div className="mt-2 p-3 bg-white rounded text-xs">
                <div className={`mb-2 p-2 rounded ${
                  createResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {createResult.success ? '✅ Admin created successfully!' : '❌ Failed to create admin'}
                </div>
                <details>
                  <summary className="cursor-pointer">Show details</summary>
                  <pre className="mt-2 overflow-auto max-h-32">
                    {JSON.stringify(createResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Tests Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">🔍 Debug: Check Database</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testAdminUsers} disabled={loading} variant="outline" className="w-full mb-2">
                Check Admin Users Table
              </Button>
              
              {adminUsers && (
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                  <div className={`mb-2 p-2 rounded ${
                    adminUsers.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {adminUsers.success ? `✅ Found ${adminUsers.count} users` : '❌ Database Error'}
                  </div>
                  <details>
                    <summary className="cursor-pointer">Show details</summary>
                    <pre className="mt-2 overflow-auto max-h-32">
                      {JSON.stringify(adminUsers, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg">🧪 Debug: Test Login API</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testLoginAPI} disabled={loading} variant="outline" className="w-full mb-2">
                Test Login API
              </Button>
              
              {loginResult && (
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                  <div className={`mb-2 p-2 rounded ${
                    loginResult.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    Status: {loginResult.status} - {loginResult.success ? 'Success' : 'Failed'}
                  </div>
                  <details>
                    <summary className="cursor-pointer">Show details</summary>
                    <pre className="mt-2 overflow-auto max-h-32">
                      {JSON.stringify(loginResult, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yoursite.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                🔐 Test Credentials
              </p>
              <p className="text-xs text-blue-700">
                Email: admin@yoursite.com<br />
                Password: admin123
              </p>
              <p className="text-xs text-blue-600 mt-2">
                After creating the correct admin user above, login should work!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}