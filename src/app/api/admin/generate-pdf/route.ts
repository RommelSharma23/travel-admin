// src/app/api/admin/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePDF, getDownloadUrl } from '../../../../lib/pdf-generator';
import { supabase } from '../../../../lib/supabase';
import { PDFGenerationRequest } from '../../../../types/pdf-generator.types';

export async function POST(request: NextRequest) {
  try {
    console.log('PDF generation API called');
    
    const body: PDFGenerationRequest = await request.json();
    const { formData, generationType, destinationId, packageId } = body;
    
    console.log('Request data:', { 
      generationType, 
      destinationId, 
      packageId,
      customerName: formData.customerInfo.customerName 
    });

    // Validate required fields
    if (!formData.customerInfo.customerName) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    if (!formData.tripDetails.packageTitle) {
      return NextResponse.json(
        { error: 'Package title is required' },
        { status: 400 }
      );
    }

    // Check for destination (either destinationId or destination text)
    if (!formData.tripDetails.destinationId && !formData.tripDetails.destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    if (!formData.pricing.totalPackagePrice || formData.pricing.totalPackagePrice <= 0) {
      return NextResponse.json(
        { error: 'Valid package price is required' },
        { status: 400 }
      );
    }

    // Generate the PDF
    console.log('Starting PDF generation...');
    
    // Fetch hero image and destination name
    let heroImage = '';
    let destinationName = '';
    
    // Check if we have destinationId (new format) or need to use the provided destinationId parameter
    const targetDestinationId = formData.tripDetails.destinationId || destinationId;
    
    if (targetDestinationId) {
      try {
        const { data: destination, error: destError } = await supabase
          .from('destinations')
          .select('hero_image, name, country')
          .eq('id', targetDestinationId)
          .single();
        
        if (!destError && destination) {
          heroImage = destination.hero_image || '';
          destinationName = `${destination.name}, ${destination.country}`;
          console.log('Hero image found:', heroImage);
          console.log('Destination name:', destinationName);
        }
      } catch (error) {
        console.log('Could not fetch destination data:', error);
      }
    }
    
    // Update form data with destination name if we fetched it
    const updatedFormData = {
      ...formData,
      tripDetails: {
        ...formData.tripDetails,
        destination: destinationName || formData.tripDetails.destination || ''
      }
    };
    
    const { filename, fileSize } = await generatePDF(updatedFormData, 'admin-user', heroImage);
    
    const downloadUrl = getDownloadUrl(filename);
    console.log('PDF generated successfully:', { filename, fileSize, downloadUrl });

    // Save audit record to database
    try {
      const auditData = {
        admin_user_id: 'admin-user', // TODO: Get from actual auth session
        customer_name: formData.customerInfo.customerName,
        destination_id: destinationId || null,
        package_id: packageId || null,
        form_data: formData,
        pdf_filename: filename,
        generation_type: generationType,
        file_size_kb: fileSize,
        download_count: 0
      };

      const { data: auditRecord, error: auditError } = await supabase
        .from('pdf_audit')
        .insert(auditData)
        .select('id')
        .single();

      if (auditError) {
        console.error('Failed to save audit record:', auditError);
        // Don't fail the request if audit fails
      } else {
        console.log('Audit record saved:', auditRecord?.id);
      }
    } catch (auditError) {
      console.error('Audit save error:', auditError);
      // Continue with successful response even if audit fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      filename,
      downloadUrl,
      fileSize,
      message: 'PDF generated successfully'
    });

  } catch (error) {
    console.error('PDF generation API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}