// src/app/api/admin/package-details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const packageId = searchParams.get('package_id');

    if (!packageId) {
      return NextResponse.json(
        { error: 'package_id parameter is required' },
        { status: 400 }
      );
    }

    // Get package details with destination
    const { data: packageData, error: packageError } = await supabase
      .from('tour_packages')
      .select(`
        *,
        destinations (
          id,
          name,
          country,
          description
        )
      `)
      .eq('id', packageId)
      .single();

    if (packageError) {
      console.error('Package details fetch error:', packageError);
      return NextResponse.json({ error: packageError.message }, { status: 500 });
    }

    if (!packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Create basic itinerary if none exists (you can enhance this later)
    const basicItinerary = [];
    for (let i = 1; i <= packageData.duration_days; i++) {
      basicItinerary.push({
        day_number: i,
        day_title: `Day ${i}`,
        day_description: `Activities for day ${i}`
      });
    }

    return NextResponse.json({
      package: packageData,
      destination: packageData.destinations,
      itinerary: basicItinerary
    });
  } catch (error) {
    console.error('Package details API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package details' },
      { status: 500 }
    );
  }
}