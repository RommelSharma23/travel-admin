// /app/api/blog-content/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: blogContent, error } = await supabase
      .from('blog_content')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !blogContent) {
      return NextResponse.json(
        { error: 'Blog content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      blogContent
    });

  } catch (error) {
    console.error('Get blog content error:', error);
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

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: blogContent, error } = await supabase
      .from('blog_content')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog content:', error);
      return NextResponse.json(
        { error: 'Failed to update blog content', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blogContent,
      message: 'Blog content updated successfully'
    });

  } catch (error) {
    console.error('Update blog content error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // First check if blog content exists
    const { data: existingContent, error: checkError } = await supabase
      .from('blog_content')
      .select('id, blog_header_id')
      .eq('id', params.id)
      .single();

    if (checkError || !existingContent) {
      return NextResponse.json(
        { error: 'Blog content not found' },
        { status: 404 }
      );
    }

    // Delete the blog content
    const { error: deleteError } = await supabase
      .from('blog_content')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting blog content:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete blog content', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog content deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog content error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}