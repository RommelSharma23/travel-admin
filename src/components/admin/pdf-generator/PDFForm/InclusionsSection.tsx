// src/components/admin/pdf-generator/PDFForm/InclusionsSection.tsx
'use client';

import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { PDFFormData } from '../../../../types/pdf-generator.types';
import { useState } from 'react';
import { X, Plus, Check, Minus } from 'lucide-react';

interface InclusionsSectionProps {
  watch: UseFormWatch<PDFFormData>;
  setValue: UseFormSetValue<PDFFormData>;
}

export default function InclusionsSection({ watch, setValue }: InclusionsSectionProps) {
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  
  const inclusions = watch('inclusions') || [];
  const exclusions = watch('exclusions') || [];

  // Common inclusion templates
  const commonInclusions = [
    'Accommodation in selected hotels',
    'Daily breakfast',
    'Airport transfers',
    'Transportation as per itinerary',
    'Professional tour guide',
    'Entry fees to monuments',
    'All meals (breakfast, lunch, dinner)',
    'Travel insurance'
  ];

  // Common exclusion templates
  const commonExclusions = [
    'International flights',
    'Visa fees',
    'Personal expenses',
    'Travel insurance',
    'Tips and gratuities',
    'Alcoholic beverages',
    'Optional activities',
    'Laundry services'
  ];

  const addInclusion = () => {
    if (newInclusion.trim() && !inclusions.includes(newInclusion.trim())) {
      setValue('inclusions', [...inclusions, newInclusion.trim()]);
      setNewInclusion('');
    }
  };

  const addExclusion = () => {
    if (newExclusion.trim() && !exclusions.includes(newExclusion.trim())) {
      setValue('exclusions', [...exclusions, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const removeInclusion = (index: number) => {
    const updated = inclusions.filter((_, i) => i !== index);
    setValue('inclusions', updated);
  };

  const removeExclusion = (index: number) => {
    const updated = exclusions.filter((_, i) => i !== index);
    setValue('exclusions', updated);
  };

  const addFromTemplate = (item: string, type: 'inclusion' | 'exclusion') => {
    if (type === 'inclusion' && !inclusions.includes(item)) {
      setValue('inclusions', [...inclusions, item]);
    } else if (type === 'exclusion' && !exclusions.includes(item)) {
      setValue('exclusions', [...exclusions, item]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'inclusion' | 'exclusion') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'inclusion') {
        addInclusion();
      } else {
        addExclusion();
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Inclusions & Exclusions</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inclusions */}
        <div>
          <div className="flex items-center mb-3">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="text-md font-medium text-gray-900">What's Included</h4>
          </div>
          
          {/* Add new inclusion */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'inclusion')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              placeholder="Add what's included..."
            />
            <button
              type="button"
              onClick={addInclusion}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Display inclusions */}
          <div className="space-y-2 mb-4">
            {inclusions.map((inclusion, index) => (
              <div key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-md border border-green-200">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">{inclusion}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeInclusion(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Common inclusion templates */}
          <div>
            <h5 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Common Inclusions</h5>
            <div className="space-y-1">
              {commonInclusions.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addFromTemplate(item, 'inclusion')}
                  disabled={inclusions.includes(item)}
                  className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                    inclusions.includes(item)
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  {inclusions.includes(item) ? '✓ ' : '+ '}{item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exclusions */}
        <div>
          <div className="flex items-center mb-3">
            <Minus className="h-5 w-5 text-red-600 mr-2" />
            <h4 className="text-md font-medium text-gray-900">What's Not Included</h4>
          </div>
          
          {/* Add new exclusion */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'exclusion')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              placeholder="Add what's not included..."
            />
            <button
              type="button"
              onClick={addExclusion}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Display exclusions */}
          <div className="space-y-2 mb-4">
            {exclusions.map((exclusion, index) => (
              <div key={index} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-md border border-red-200">
                <div className="flex items-center">
                  <Minus className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-gray-700">{exclusion}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeExclusion(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Common exclusion templates */}
          <div>
            <h5 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Common Exclusions</h5>
            <div className="space-y-1">
              {commonExclusions.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addFromTemplate(item, 'exclusion')}
                  disabled={exclusions.includes(item)}
                  className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                    exclusions.includes(item)
                      ? 'bg-red-100 text-red-700 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  {exclusions.includes(item) ? '✓ ' : '+ '}{item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {(inclusions.length > 0 || exclusions.length > 0) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Summary</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-600 font-medium">{inclusions.length} inclusions</span>
            </div>
            <div>
              <span className="text-red-600 font-medium">{exclusions.length} exclusions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}