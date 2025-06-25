// src/components/admin/pdf-generator/PDFForm/index.tsx
'use client';

import { useForm } from 'react-hook-form';
import { PDFFormData } from '../../../../types/pdf-generator.types';
import { usePDFGeneration } from '../../../../hooks/usePDFGeneration';
import { useState, useEffect } from 'react';
import { FileDown, Loader2, AlertCircle } from 'lucide-react';

// Import form sections
import CustomerInfoSection from './CustomerInfoSection';
import TripDetailsSection from './TripDetailsSection';
import PricingSection from './PricingSection';
import InclusionsSection from './InclusionsSection';
import ItineraryBuilder from './ItineraryBuilder';
import AdditionalInfoSection from './AdditionalInfoSection';

interface PDFFormProps {
  generationType: 'scratch' | 'prepopulated';
  destinationId?: number;
  packageId?: number;
  onBack: () => void;
}

export default function PDFForm({ generationType, destinationId, packageId, onBack }: PDFFormProps) {
  const [isPrePopulating, setIsPrePopulating] = useState(false);
  const { generating, error, generatePDF, fetchPackageDetails, clearError } = usePDFGeneration();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<PDFFormData>({
    defaultValues: {
      customerInfo: {
        customerName: '',
        email: '',
        phone: '',
        totalTravelers: 1,
        specialRequirements: ''
      },
      tripDetails: {
        packageTitle: '',
        destination: '',
        destinationId: undefined,
        duration: '',
        tripDescription: '',
        packageHighlights: []
      },
      pricing: {
        totalPackagePrice: 0,
        currency: 'INR',
        priceNotes: ''
      },
      inclusions: [],
      exclusions: [],
      itinerary: [{
        dayNumber: 1,
        dayTitle: 'Day 1',
        dayDescription: ''
      }],
      additionalInfo: {
        termsConditions: '',
        additionalNotes: ''
      }
    }
  });

  // Pre-populate form if needed
  useEffect(() => {
    if (generationType === 'prepopulated' && packageId) {
      prePopulateForm();
    }
  }, [generationType, packageId]);

  const prePopulateForm = async () => {
    if (!packageId) return;

    setIsPrePopulating(true);
    try {
      const packageDetails = await fetchPackageDetails(packageId.toString());
      
      if (packageDetails) {
        const { package: pkg, destination, itinerary } = packageDetails;

        // Pre-populate form with package data
        setValue('tripDetails.packageTitle', pkg.title || '');
        setValue('tripDetails.destination', `${destination.name}, ${destination.country}` || '');
        setValue('tripDetails.destinationId', destination.id);
        setValue('tripDetails.duration', `${pkg.duration_days} Days, ${pkg.duration_nights} Nights` || '');
        setValue('tripDetails.tripDescription', pkg.long_description || pkg.short_description || '');
        setValue('tripDetails.maxGroupSize', pkg.max_group_size || undefined);
        setValue('tripDetails.packageHighlights', pkg.highlights || []);

        setValue('pricing.totalPackagePrice', pkg.price_from || 0);
        setValue('pricing.currency', pkg.currency || 'USD');

        setValue('inclusions', pkg.inclusions || []);
        setValue('exclusions', pkg.exclusions || []);

        // Set itinerary
        if (itinerary && itinerary.length > 0) {
          setValue('itinerary', itinerary);
        }

        console.log('Form pre-populated with package data');
      }
    } catch (error) {
      console.error('Error pre-populating form:', error);
    } finally {
      setIsPrePopulating(false);
    }
  };

  const onSubmit = async (data: PDFFormData) => {
    try {
      clearError();
      await generatePDF(data, generationType, destinationId, packageId);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (isPrePopulating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Loading Package Data</h2>
          <p className="text-gray-600">Pre-populating form with selected package information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create PDF Proposal</h1>
              <p className="mt-2 text-gray-600">
                {generationType === 'scratch' 
                  ? 'Build a custom travel proposal from scratch'
                  : 'Customize the pre-populated proposal details'
                }
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Customer Information */}
          <CustomerInfoSection register={register} errors={errors} />

          {/* Trip Details */}
          <TripDetailsSection 
            register={register} 
            errors={errors} 
            watch={watch} 
            setValue={setValue} 
          />

          {/* Pricing */}
          <PricingSection register={register} errors={errors} />

          {/* Inclusions & Exclusions */}
          <InclusionsSection watch={watch} setValue={setValue} />

          {/* Itinerary */}
          <ItineraryBuilder watch={watch} setValue={setValue} errors={errors} />

          {/* Additional Information */}
          <AdditionalInfoSection register={register} />

          {/* Form Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to Generate PDF?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Review all sections above and click generate when ready
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={generating || !isValid}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                    generating || !isValid
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4" />
                      Generate PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Form Status */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Form Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Validation: </span>
              <span className={`font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {isValid ? 'Valid' : 'Invalid'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Type: </span>
              <span className="font-medium text-blue-600">
                {generationType === 'scratch' ? 'From Scratch' : 'Pre-populated'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Errors: </span>
              <span className="font-medium text-gray-900">
                {Object.keys(errors).length} field(s)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}