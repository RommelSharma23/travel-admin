// /app/api/blog-headers/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: blogHeader, error } = await supabase
      .from('blog_headers')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !blogHeader) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      blogHeader
    });

  } catch (error) {
    console.error('Get blog header error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    
    // Remove undefined values and prepare update data
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined)
    );

    // If blog_name is being updated, regenerate slug
    if (updateData.blog_name && typeof updateData.blog_name === 'string') {
      const newSlug = updateData.blog_name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check if new slug conflicts with existing blog posts (excluding current one)
      const { data: existingBlog } = await supabase
        .from('blog_headers')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', params.id)
        .single();

      if (existingBlog) {
        return NextResponse.json(
          { error: 'A blog post with this title already exists' },
          { status: 400 }
        );
      }

      updateData.slug = newSlug;
    }

    // Handle status changes
    if (updateData.status) {
      if (updateData.status === 'Published' && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      } else if (updateData.status === 'Draft') {
        updateData.published_at = null;
      }
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: blogHeader, error } = await supabase
      .from('blog_headers')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog header:', error);
      return NextResponse.json(
        { error: 'Failed to update blog post', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blogHeader,
      message: 'Blog post updated successfully'
    });

  } catch (error) {
    console.error('Update blog header error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // First check if blog post exists
    const { data: existingBlog, error: checkError } = await supabase
      .from('blog_headers')
      .select('id, blog_name')
      .eq('id', params.id)
      .single();

    if (checkError || !existingBlog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Delete related blog content first (due to foreign key constraint)
    const { error: contentDeleteError } = await supabase
      .from('blog_content')
      .delete()
      .eq('blog_header_id', params.id);

    if (contentDeleteError) {
      console.error('Error deleting blog content:', contentDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete blog content', details: contentDeleteError.message },
        { status: 500 }
      );
    }

    // Now delete the blog header
    const { error: headerDeleteError } = await supabase
      .from('blog_headers')
      .delete()
      .eq('id', params.id);

    if (headerDeleteError) {
      console.error('Error deleting blog header:', headerDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete blog post', details: headerDeleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog header error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}