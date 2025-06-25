// src/components/admin/pdf-generator/PDFForm/TripDetailsSection.tsx
'use client';

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { PDFFormData } from '../../../../types/pdf-generator.types';
import { useDestinations } from '../../../../hooks/useDestinations';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TripDetailsSectionProps {
  register: UseFormRegister<PDFFormData>;
  errors: FieldErrors<PDFFormData>;
  watch: UseFormWatch<PDFFormData>;
  setValue: UseFormSetValue<PDFFormData>;
}

export default function TripDetailsSection({ register, errors, watch, setValue }: TripDetailsSectionProps) {
  const [newHighlight, setNewHighlight] = useState('');
  const packageHighlights = watch('tripDetails.packageHighlights') || [];
  const selectedDestinationId = watch('tripDetails.destinationId');
  
  // Use the same destinations hook as the pre-populate flow
  const { destinations, loading, error } = useDestinations();

  const addHighlight = () => {
    if (newHighlight.trim()) {
      const updatedHighlights = [...packageHighlights, newHighlight.trim()];
      setValue('tripDetails.packageHighlights', updatedHighlights);
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    const updatedHighlights = packageHighlights.filter((_, i) => i !== index);
    setValue('tripDetails.packageHighlights', updatedHighlights);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHighlight();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Package Title */}
        <div className="md:col-span-2">
          <label htmlFor="packageTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Package Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="packageTitle"
            {...register('tripDetails.packageTitle', { 
              required: 'Package title is required' 
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.tripDetails?.packageTitle ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter package title"
          />
          {errors.tripDetails?.packageTitle && (
            <p className="mt-1 text-sm text-red-600">{errors.tripDetails.packageTitle.message}</p>
          )}
        </div>

        {/* Destination Dropdown */}
        <div>
          <label htmlFor="destinationId" className="block text-sm font-medium text-gray-700 mb-1">
            Destination <span className="text-red-500">*</span>
          </label>
          {loading ? (
            <div className="h-10 bg-gray-100 animate-pulse rounded-md border"></div>
          ) : error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          ) : (
            <select
              id="destinationId"
              {...register('tripDetails.destinationId', { 
                required: 'Destination is required' 
              })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.tripDetails?.destinationId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select destination...</option>
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.name}, {destination.country}
                </option>
              ))}
            </select>
          )}
          {errors.tripDetails?.destinationId && (
            <p className="mt-1 text-sm text-red-600">{errors.tripDetails.destinationId.message}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Duration <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="duration"
            {...register('tripDetails.duration', { 
              required: 'Duration is required' 
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.tripDetails?.duration ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., 7 Days, 6 Nights"
          />
          {errors.tripDetails?.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.tripDetails.duration.message}</p>
          )}
        </div>

        {/* Max Group Size */}
        <div>
          <label htmlFor="maxGroupSize" className="block text-sm font-medium text-gray-700 mb-1">
            Max Group Size
          </label>
          <input
            type="number"
            id="maxGroupSize"
            min="1"
            {...register('tripDetails.maxGroupSize')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="12"
          />
        </div>

        {/* Trip Description */}
        <div className="md:col-span-2">
          <label htmlFor="tripDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Trip Description
          </label>
          <textarea
            id="tripDescription"
            rows={4}
            {...register('tripDetails.tripDescription')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the trip experience, highlights, and what makes it special..."
          />
        </div>

        {/* Package Highlights */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Package Highlights
          </label>
          
          {/* Add new highlight */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a package highlight..."
            />
            <button
              type="button"
              onClick={addHighlight}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Display highlights */}
          {packageHighlights.length > 0 && (
            <div className="space-y-2">
              {packageHighlights.map((highlight, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                  <span className="text-sm text-gray-700">{highlight}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}