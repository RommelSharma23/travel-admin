// src/app/api/admin/destinations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('id, name, country, slug')
      .eq('status', 'published')
      .order('name');

    if (error) {
      console.error('Destinations fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ destinations });
  } catch (error) {
    console.error('Destinations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}