// src/app/api/admin/packages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destinationId = searchParams.get('destination_id');

    if (!destinationId) {
      return NextResponse.json(
        { error: 'destination_id parameter is required' },
        { status: 400 }
      );
    }

    const { data: packages, error } = await supabase
      .from('tour_packages')
      .select(`
        id,
        title,
        duration_days,
        duration_nights,
        price_from,
        price_to,
        currency
      `)
      .eq('destination_id', destinationId)
      .order('title');

    if (error) {
      console.error('Packages fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Packages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}