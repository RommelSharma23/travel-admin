// /app/api/blog-content/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blogHeaderId = searchParams.get('blog_header_id');

    let query = supabase
      .from('blog_content')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by blog_header_id if provided
    if (blogHeaderId) {
      query = query.eq('blog_header_id', blogHeaderId);
    }

    const { data: blogContent, error } = await query;

    if (error) {
      console.error('Error fetching blog content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blog content', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blogContent: blogContent || [],
      count: (blogContent || []).length
    });

  } catch (error) {
    console.error('Blog content API error:', error);
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
      blog_header_id,
      blog_text,
      gallery
    } = body;

    // Basic validation
    if (!blog_header_id) {
      return NextResponse.json(
        { error: 'Blog header ID is required' },
        { status: 400 }
      );
    }

    if (!blog_text) {
      return NextResponse.json(
        { error: 'Blog content text is required' },
        { status: 400 }
      );
    }

    // Verify that the blog header exists
    const { data: blogHeader, error: headerError } = await supabase
      .from('blog_headers')
      .select('id')
      .eq('id', blog_header_id)
      .single();

    if (headerError || !blogHeader) {
      return NextResponse.json(
        { error: 'Blog header not found' },
        { status: 404 }
      );
    }

    // Check if content already exists for this blog header
    const { data: existingContent } = await supabase
      .from('blog_content')
      .select('id')
      .eq('blog_header_id', blog_header_id)
      .single();

    if (existingContent) {
      return NextResponse.json(
        { error: 'Content already exists for this blog post. Use PATCH to update.' },
        { status: 400 }
      );
    }

    // Insert new blog content
    const insertData = {
      blog_header_id: parseInt(blog_header_id),
      blog_text,
      gallery: gallery || {}
    };

    const { data: blogContent, error } = await supabase
      .from('blog_content')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating blog content:', error);
      return NextResponse.json(
        { error: 'Failed to create blog content', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blogContent,
      message: 'Blog content created successfully'
    });

  } catch (error) {
    console.error('Create blog content error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}