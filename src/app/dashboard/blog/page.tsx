'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Eye, Edit, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

interface BlogHeader {
  id: number;
  blog_name: string;
  slug: string;
  status: 'Draft' | 'Published' | 'Archived';
  author_name: string | null;
  published_at: string | null;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  category: string | null;
  sub_heading: string | null;
  excerpt: string | null;
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog-headers?withUsageCount=true');
      const data = await response.json();

      if (response.ok) {
        setBlogs(data.blogHeaders || []);
      } else {
        setError(data.error || 'Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Network error while fetching blog posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.blog_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (blog.author_name && blog.author_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || blog.status === statusFilter;
    
    const matchesCategory = categoryFilter === '' || blog.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusToggle = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    
    try {
      const response = await fetch(`/api/blog-headers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          published_at: newStatus === 'Published' ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        setBlogs(blogs.map(blog => 
          blog.id === id 
            ? { ...blog, status: newStatus as any, published_at: newStatus === 'Published' ? new Date().toISOString() : null }
            : blog
        ));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Network error while updating status');
    }
  };

  const handleDelete = async (id: number, blogName: string) => {
    if (!confirm(`Are you sure you want to delete "${blogName}"? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/blog-headers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog.id !== id));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Network error while deleting blog post');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'text-green-600 bg-green-100';
      case 'Draft': return 'text-gray-600 bg-gray-100';
      case 'Archived': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString();
  };

  // Get unique categories for filter
 const categories = Array.from(new Set(blogs.map(blog => blog.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Blog Management</h1>
        </div>
        <div className="text-center py-8">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-2">Manage your blog posts and articles</p>
        </div>
        <Link href="/dashboard/blog/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Blog Post
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{blogs.length}</div>
            <p className="text-xs text-muted-foreground">Total Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {blogs.filter(b => b.status === 'Published').length}
            </div>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {blogs.filter(b => b.status === 'Draft').length}
            </div>
            <p className="text-xs text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {blogs.filter(b => b.is_featured).length}
            </div>
            <p className="text-xs text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <Input
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full md:w-auto md:min-w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex h-10 w-full md:w-auto md:min-w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                 <option key={category} value={category || ''}>{category}</option>
                ))}
              </select>
              
              <Button variant="outline">
                🔍 Search
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                📱 Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                📋 List
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter || categoryFilter) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <button 
                    onClick={() => setStatusFilter('')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {categoryFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {categoryFilter}
                  <button 
                    onClick={() => setCategoryFilter('')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCategoryFilter('');
                }}
                className="h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  📝
                </div>
                <div className="absolute top-2 right-2 space-y-1">
                  <Badge 
                    variant={blog.status === 'Published' ? 'success' : 'secondary'} 
                    className="text-xs"
                  >
                    {blog.status}
                  </Badge>
                  {blog.is_featured && (
                    <Badge variant="warning" className="text-xs block">
                      ⭐ Featured
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight">
                  {blog.blog_name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {blog.sub_heading || blog.excerpt || 'No description available'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    <div>By: {blog.author_name || 'Unknown'}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Eye className="w-3 h-3" />
                      {blog.view_count} views
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {blog.category && (
                      <Badge variant="outline" className="mb-1">
                        {blog.category}
                      </Badge>
                    )}
                    <div>{formatDate(blog.published_at)}</div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/blog/edit/${blog.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        ✏️ Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(blog.id, blog.status)}
                      className="flex-1"
                    >
                      {blog.status === 'Published' ? '⏸️ Unpublish' : '▶️ Publish'}
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(blog.id, blog.blog_name)}
                    className="w-full"
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {blog.blog_name}
                            {blog.is_featured && (
                              <span className="text-yellow-500 text-sm">⭐</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">/{blog.slug}</div>
                          {blog.sub_heading && (
                            <div className="text-sm text-gray-400 mt-1 line-clamp-1">
                              {blog.sub_heading}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={blog.status === 'Published' ? 'success' : 'secondary'}>
                          {blog.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {blog.author_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        {blog.category ? (
                          <Badge variant="outline">{blog.category}</Badge>
                        ) : (
                          <span className="text-gray-400">Uncategorized</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(blog.published_at)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {blog.view_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {/* Status Toggle */}
                        <button
                          onClick={() => handleStatusToggle(blog.id, blog.status)}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            blog.status === 'Published' ? 'text-green-600' : 'text-gray-400'
                          }`}
                          title={blog.status === 'Published' ? 'Set to Draft' : 'Publish'}
                        >
                          {blog.status === 'Published' ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>

                        {/* Edit */}
                        <Link href={`/dashboard/blog/edit/${blog.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>

                        {/* Delete */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(blog.id, blog.blog_name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredBlogs.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter || categoryFilter 
                ? 'Try adjusting your search or filter terms' 
                : 'Get started by creating your first blog post'
              }
            </p>
            <Link href="/dashboard/blog/new">
              <Button>Create Your First Blog Post</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}