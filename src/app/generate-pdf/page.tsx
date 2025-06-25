// src/app/generate-pdf/page.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import SelectionCards from '../../components/admin/pdf-generator/SelectionCards';
import DestinationSelector from '../../components/admin/pdf-generator/DestinationSelector';
import PackageSelector from '../../components/admin/pdf-generator/PackageSelector';
import PDFForm from '../../components/admin/pdf-generator/PDFForm';

type GenerationType = 'scratch' | 'prepopulated' | null;

export default function GeneratePDFPage() {
  const [generationType, setGenerationType] = useState<GenerationType>(null);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  const handleTypeSelection = (type: 'scratch' | 'prepopulated') => {
    setGenerationType(type);
    // Reset selections when switching types
    setSelectedDestinationId('');
    setSelectedPackageId('');
    setShowForm(false);
  };

  const handleDestinationSelect = (destinationId: string) => {
    setSelectedDestinationId(destinationId);
    // Clear package selection when destination changes
    setSelectedPackageId('');
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId);
  };

  const handleBack = () => {
    if (showForm) {
      // Go back to configuration
      setShowForm(false);
    } else {
      // Go back to selection
      setGenerationType(null);
      setSelectedDestinationId('');
      setSelectedPackageId('');
    }
  };

  const canProceed = () => {
    if (generationType === 'scratch') {
      return true; // Can always proceed with scratch
    }
    if (generationType === 'prepopulated') {
      return selectedDestinationId && selectedPackageId; // Need both selections
    }
    return false;
  };

  const handleProceed = () => {
    if (canProceed()) {
      setShowForm(true);
    }
  };

  // Show the form if user has proceeded
  if (showForm && generationType) {
    return (
      <PDFForm
        generationType={generationType}
        destinationId={selectedDestinationId ? parseInt(selectedDestinationId) : undefined}
        packageId={selectedPackageId ? parseInt(selectedPackageId) : undefined}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate PDF Proposal</h1>
              <p className="mt-2 text-gray-600">
                Create professional travel proposals for your customers
              </p>
            </div>
            {generationType && (
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Selection
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {!generationType ? (
          /* Selection Cards */
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Choose how you want to create your proposal
            </h2>
            <SelectionCards onSelectType={handleTypeSelection} />
          </div>
        ) : (
          /* Configuration */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {generationType === 'scratch' ? 'Generate from Scratch' : 'Pre-populate from Database'}
              </h2>
              <p className="text-gray-600 mt-1">
                {generationType === 'scratch' 
                  ? 'You will create a completely custom proposal'
                  : 'Select a destination and package to pre-fill the proposal'}
              </p>
            </div>

            {generationType === 'prepopulated' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DestinationSelector
                    onDestinationSelect={handleDestinationSelect}
                    selectedDestinationId={selectedDestinationId}
                  />
                  <PackageSelector
                    destinationId={selectedDestinationId}
                    onPackageSelect={handlePackageSelect}
                    selectedPackageId={selectedPackageId}
                  />
                </div>

                {selectedDestinationId && selectedPackageId && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Ready to proceed! Your form will be pre-populated with the selected package data.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Proceed Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleProceed}
                disabled={!canProceed()}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {generationType === 'scratch' ? 'Start Creating' : 'Load Package Data'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}