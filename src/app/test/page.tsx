// src/app/test/page.tsx
export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        
        <div className="bg-blue-100 p-4 rounded mb-4">
          <p className="text-blue-800">✅ Test page is loading correctly!</p>
          <p className="text-blue-600 text-sm mt-2">If you can see this, the page routing works.</p>
        </div>

        <button
          onClick={() => alert('Button clicked!')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Simple Test Button
        </button>

        <div className="mt-6 text-sm text-gray-600">
          <p>This is a simplified test page.</p>
          <p className="mt-2">No Supabase connection yet - just testing routing.</p>
        </div>
      </div>
    </div>
  )
}