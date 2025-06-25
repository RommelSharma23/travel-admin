// /app/api/blog-headers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const withUsageCount = searchParams.get('withUsageCount') === 'true';

    let query = supabase
      .from('blog_headers')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`blog_name.ilike.%${search}%,excerpt.ilike.%${search}%,author_name.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: blogHeaders, error } = await query;

    if (error) {
      console.error('Error fetching blog headers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blog posts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blogHeaders: blogHeaders || [],
      count: (blogHeaders || []).length
    });

  } catch (error) {
    console.error('Blog headers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      blog_name,
      sub_heading,
      excerpt,
      featured_image,
      meta_title,
      meta_description,
      keywords,
      category,
      tags,
      related_destination_id,
      status = 'Draft',
      is_featured = false,
      author_name,
      author_bio,
      author_image
    } = body;

    // Basic validation
    if (!blog_name) {
      return NextResponse.json(
        { error: 'Blog title is required' },
        { status: 400 }
      );
    }

    // Generate slug from blog_name
    const slug = blog_name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const { data: existingBlog } = await supabase
      .from('blog_headers')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingBlog) {
      return NextResponse.json(
        { error: 'A blog post with this title already exists' },
        { status: 400 }
      );
    }

    // Insert new blog header
    const insertData = {
      blog_name,
      sub_heading,
      slug,
      excerpt,
      featured_image,
      meta_title: meta_title || blog_name,
      meta_description,
      keywords: keywords || [],
      category,
      tags: tags || [],
      related_destination_id,
      status,
      published_at: status === 'Published' ? new Date().toISOString() : null,
      is_featured,
      author_name,
      author_bio,
      author_image,
      view_count: 0
    };

    const { data: blogHeader, error } = await supabase
      .from('blog_headers')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating blog header:', error);
      return NextResponse.json(
        { error: 'Failed to create blog post', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blogHeader,
      message: 'Blog post created successfully'
    });

  } catch (error) {
    console.error('Create blog header error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}