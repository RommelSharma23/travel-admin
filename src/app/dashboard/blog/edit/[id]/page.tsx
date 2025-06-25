
/* /app/dashboard/blog/edit/[id]/page.tsx*/
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import dynamic from 'next/dynamic';

// Dynamic import for rich text editor to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface PageProps {
  params: { id: string };
}

interface BlogHeader {
  id: number;
  blog_name: string;
  sub_heading: string | null;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  category: string | null;
  tags: string[] | null;
  related_destination_id: number | null;
  status: 'Draft' | 'Published' | 'Archived';
  published_at: string | null;
  is_featured: boolean;
  author_name: string | null;
  author_bio: string | null;
  author_image: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface BlogContent {
  id: number;
  blog_header_id: number;
  blog_text: string;
  gallery: any;
  created_at: string;
  updated_at: string;
}

interface BlogFormData {
  blog_name: string;
  sub_heading: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  category: string;
  tags: string[];
  related_destination_id: number | null;
  status: 'Draft' | 'Published' | 'Archived';
  is_featured: boolean;
  author_name: string;
  author_bio: string;
  author_image: string;
}

export default function EditBlogPage({ params }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blogContent, setBlogContent] = useState('');
  const [originalData, setOriginalData] = useState<BlogHeader | null>(null);
  const [originalContent, setOriginalContent] = useState<BlogContent | null>(null);
  
  const [formData, setFormData] = useState<BlogFormData>({
    blog_name: '',
    sub_heading: '',
    slug: '',
    excerpt: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    keywords: [],
    category: '',
    tags: [],
    related_destination_id: null,
    status: 'Draft',
    is_featured: false,
    author_name: '',
    author_bio: '',
    author_image: ''
  });

  useEffect(() => {
    fetchBlogData();
  }, [params.id]);

  const fetchBlogData = async () => {
    try {
      setFetchLoading(true);
      
      // Fetch blog header
      const headerResponse = await fetch(`/api/blog-headers/${params.id}`);
      const headerData = await headerResponse.json();

      if (headerResponse.ok) {
        const blog = headerData.blogHeader;
        setOriginalData(blog);
        
        setFormData({
          blog_name: blog.blog_name || '',
          sub_heading: blog.sub_heading || '',
          slug: blog.slug || '',
          excerpt: blog.excerpt || '',
          featured_image: blog.featured_image || '',
          meta_title: blog.meta_title || '',
          meta_description: blog.meta_description || '',
          keywords: blog.keywords || [],
          category: blog.category || '',
          tags: blog.tags || [],
          related_destination_id: blog.related_destination_id,
          status: blog.status || 'Draft',
          is_featured: blog.is_featured || false,
          author_name: blog.author_name || '',
          author_bio: blog.author_bio || '',
          author_image: blog.author_image || ''
        });

        // Fetch blog content
        const contentResponse = await fetch(`/api/blog-content?blog_header_id=${params.id}`);
        const contentData = await contentResponse.json();

        if (contentResponse.ok && contentData.blogContent.length > 0) {
          const content = contentData.blogContent[0];
          setOriginalContent(content);
          setBlogContent(content.blog_text || '');
        }
      } else {
        setError(headerData.error || 'Failed to fetch blog post');
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
      setError('Network error while fetching blog post');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'keywords' || name === 'tags') {
      // Handle comma-separated arrays
      const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== '');
      setFormData(prev => ({ ...prev, [name]: arrayValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update blog header
      const headerResponse = await fetch(`/api/blog-headers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const headerData = await headerResponse.json();

      if (headerResponse.ok) {
        // Update blog content
        if (originalContent) {
          const contentResponse = await fetch(`/api/blog-content/${originalContent.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blog_text: blogContent,
              gallery: originalContent.gallery || []
            })
          });

          if (contentResponse.ok) {
            router.push('/dashboard/blog');
          } else {
            const contentData = await contentResponse.json();
            setError(contentData.error || 'Failed to update blog content');
          }
        } else {
          // Create new content if it doesn't exist
          const contentResponse = await fetch('/api/blog-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blog_header_id: parseInt(params.id),
              blog_text: blogContent,
              gallery: []
            })
          });

          if (contentResponse.ok) {
            router.push('/dashboard/blog');
          } else {
            const contentData = await contentResponse.json();
            setError(contentData.error || 'Failed to create blog content');
          }
        }
      } else {
        setError(headerData.error || 'Failed to update blog post');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate slug preview
  const slugPreview = formData.blog_name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Update slug when blog name changes
  const handleBlogNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ 
      ...prev, 
      blog_name: name, 
      slug: slug,
      meta_title: name || prev.meta_title
    }));
  };

  // Check if form has changes
  const hasChanges = originalData && (
    formData.blog_name !== originalData.blog_name ||
    formData.sub_heading !== (originalData.sub_heading || '') ||
    formData.excerpt !== (originalData.excerpt || '') ||
    formData.featured_image !== (originalData.featured_image || '') ||
    formData.meta_title !== (originalData.meta_title || '') ||
    formData.meta_description !== (originalData.meta_description || '') ||
    JSON.stringify(formData.keywords) !== JSON.stringify(originalData.keywords || []) ||
    formData.category !== (originalData.category || '') ||
    JSON.stringify(formData.tags) !== JSON.stringify(originalData.tags || []) ||
    formData.status !== originalData.status ||
    formData.is_featured !== originalData.is_featured ||
    formData.author_name !== (originalData.author_name || '') ||
    formData.author_bio !== (originalData.author_bio || '') ||
    formData.author_image !== (originalData.author_image || '') ||
    blogContent !== (originalContent?.blog_text || '')
  );

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
          <Link href="/dashboard/blog">
            <Button variant="outline">← Back to Blog Posts</Button>
          </Link>
        </div>
        <div className="text-center py-8">Loading blog post...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-gray-600 mt-2">Update blog post information and content</p>
        </div>
        <Link href="/dashboard/blog">
          <Button variant="outline">
            ← Back to Blog Posts
          </Button>
        </Link>
      </div>

      {/* Blog Statistics */}
      {originalData && (
        <Card>
          <CardHeader>
            <CardTitle>Blog Post Statistics</CardTitle>
            <CardDescription>Current performance and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {originalData.view_count || 0}
                </div>
                <div className="text-sm text-blue-800">Total Views</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {originalData.status === 'Published' ? 'Live' : 'Draft'}
                </div>
                <div className="text-sm text-green-800">Current Status</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {originalData.is_featured ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-yellow-800">Featured Post</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Date(originalData.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm text-purple-800">Created Date</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <span>You have unsaved changes</span>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential blog post details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="blog_name">Blog Title *</Label>
                <Input
                  id="blog_name"
                  name="blog_name"
                  value={formData.blog_name}
                  onChange={handleBlogNameChange}
                  placeholder="e.g., Ultimate Guide to Morocco Travel"
                  required
                />
                {slugPreview && (
                  <p className="text-xs text-gray-500 mt-1">
                    URL slug: <code className="bg-gray-100 px-1 rounded">{slugPreview}</code>
                    {originalData && slugPreview !== originalData.slug && (
                      <span className="text-amber-600 ml-1">(will be updated)</span>
                    )}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="sub_heading">Sub Heading</Label>
                <Input
                  id="sub_heading"
                  name="sub_heading"
                  value={formData.sub_heading}
                  onChange={handleInputChange}
                  placeholder="A compelling subtitle for your blog post"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select Category</option>
                  <option value="Travel Guide">Travel Guide</option>
                  <option value="Destination">Destination</option>
                  <option value="Tips">Travel Tips</option>
                  <option value="Culture">Culture</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Photography">Photography</option>
                </select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Write a brief excerpt that will appear in blog listings..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags.join(', ')}
                  onChange={handleInputChange}
                  placeholder="morocco, travel, culture, adventure"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  id="is_featured"
                  name="is_featured"
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="is_featured">Featured Post</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog Content */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Content</CardTitle>
            <CardDescription>Edit your blog post content using the rich text editor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px]">
              <ReactQuill
                value={blogContent}
                onChange={setBlogContent}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    ['link', 'image'],
                    [{ 'align': [] }],
                    ['code-block'],
                    ['clean']
                  ],
                }}
                formats={[
                  'header',
                  'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet', 'indent',
                  'link', 'image', 'align',
                  'code-block'
                ]}
                placeholder="Edit your blog post content here..."
                style={{ height: '300px' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Media & Images</CardTitle>
            <CardDescription>Featured image and gallery for your blog post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <Input
                id="featured_image"
                name="featured_image"
                type="url"
                value={formData.featured_image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the URL of your featured image
              </p>
            </div>

            {/* Image Preview */}
            {formData.featured_image && (
              <div className="pt-4 border-t border-gray-200">
                <Label>Featured Image Preview</Label>
                <div className="mt-2">
                  <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={formData.featured_image}
                      alt="Featured image preview"
                      className="w-full h-full object-cover"
                      onError={() => setError('Failed to load featured image from URL')}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Author Information */}
        <Card>
          <CardHeader>
            <CardTitle>Author Information</CardTitle>
            <CardDescription>Details about the blog post author</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author_name">Author Name</Label>
                <Input
                  id="author_name"
                  name="author_name"
                  value={formData.author_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="author_image">Author Image URL</Label>
                <Input
                  id="author_image"
                  name="author_image"
                  type="url"
                  value={formData.author_image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/author-photo.jpg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="author_bio">Author Bio</Label>
              <textarea
                id="author_bio"
                name="author_bio"
                value={formData.author_bio}
                onChange={handleInputChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Brief bio about the author..."
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Search engine optimization settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleInputChange}
                placeholder="SEO optimized title"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.meta_title.length}/60 characters
              </p>
            </div>

            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleInputChange}
                rows={3}
                maxLength={160}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Brief description for search engines..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.meta_description.length}/160 characters
              </p>
            </div>

            <div>
              <Label htmlFor="keywords">SEO Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                name="keywords"
                value={formData.keywords.join(', ')}
                onChange={handleInputChange}
                placeholder="travel, morocco, guide, destination"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Review your blog post details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Title:</strong> {formData.blog_name || 'Not set'}
              </div>
              <div>
                <strong>Status:</strong> 
                <Badge 
                  variant={formData.status === 'Published' ? 'success' : 'secondary'}
                  className="ml-2"
                >
                  {formData.status}
                </Badge>
              </div>
              <div>
                <strong>Category:</strong> {formData.category || 'Uncategorized'}
              </div>
              <div>
                <strong>Featured:</strong> {formData.is_featured ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Author:</strong> {formData.author_name || 'Not set'}
              </div>
              <div>
                <strong>Tags:</strong> {formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}
              </div>
              <div className="md:col-span-2">
                <strong>Content Length:</strong> {blogContent.replace(/<[^>]*>/g, '').length} characters
              </div>
              {originalData && (
                <>
                  <div>
                    <strong>Current Views:</strong> {originalData.view_count}
                  </div>
                  <div>
                    <strong>Last Updated:</strong> {new Date(originalData.updated_at).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/blog">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={loading || !formData.blog_name || blogContent.trim().length === 0 || !hasChanges}
          >
            {loading ? 'Updating...' : 'Update Blog Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}