// src/hooks/usePDFGeneration.ts
'use client';

import { useState } from 'react';
import { PDFFormData, PDFGenerationRequest, PackageDetailsResponse } from '../types/pdf-generator.types';

interface UsePDFGenerationReturn {
  generating: boolean;
  error: string | null;
  generatePDF: (formData: PDFFormData, generationType: 'scratch' | 'prepopulated', destinationId?: number, packageId?: number) => Promise<void>;
  fetchPackageDetails: (packageId: string) => Promise<PackageDetailsResponse | null>;
  clearError: () => void;
}

export function usePDFGeneration(): UsePDFGenerationReturn {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async (
    formData: PDFFormData,
    generationType: 'scratch' | 'prepopulated',
    destinationId?: number,
    packageId?: number
  ) => {
    try {
      setGenerating(true);
      setError(null);

      const request: PDFGenerationRequest = {
        formData,
        generationType,
        destinationId,
        packageId
      };

      const response = await fetch('/api/admin/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate PDF');
      }

      // Handle successful PDF generation
      console.log('PDF generation successful:', data);
      
      // Trigger download
      if (data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        alert(`PDF generated successfully! File: ${data.filename} (${data.fileSize}KB)`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      console.error('Error generating PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

  const fetchPackageDetails = async (packageId: string): Promise<PackageDetailsResponse | null> => {
    try {
      setError(null);

      const response = await fetch(`/api/admin/package-details?package_id=${packageId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch package details');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch package details';
      setError(errorMessage);
      console.error('Error fetching package details:', err);
      return null;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    generating,
    error,
    generatePDF,
    fetchPackageDetails,
    clearError
  };
}