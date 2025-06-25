// src/components/admin/pdf-generator/PDFForm/PricingSection.tsx
'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { PDFFormData } from '../../../../types/pdf-generator.types';

interface PricingSectionProps {
  register: UseFormRegister<PDFFormData>;
  errors: FieldErrors<PDFFormData>;
}

const currencies = [
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
];

export default function PricingSection({ register, errors }: PricingSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Package Price */}
        <div>
          <label htmlFor="totalPackagePrice" className="block text-sm font-medium text-gray-700 mb-1">
            Total Package Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="totalPackagePrice"
            min="0"
            step="0.01"
            {...register('pricing.totalPackagePrice', { 
              required: 'Package price is required',
              min: { value: 1, message: 'Price must be greater than 0' }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.pricing?.totalPackagePrice ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="50000"
          />
          {errors.pricing?.totalPackagePrice && (
            <p className="mt-1 text-sm text-red-600">{errors.pricing.totalPackagePrice.message}</p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
            Currency <span className="text-red-500">*</span>
          </label>
          <select
            id="currency"
            {...register('pricing.currency', { 
              required: 'Currency is required' 
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.pricing?.currency ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select currency...</option>
            {currencies.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
          {errors.pricing?.currency && (
            <p className="mt-1 text-sm text-red-600">{errors.pricing.currency.message}</p>
          )}
        </div>

        {/* Price Notes */}
        <div className="md:col-span-2">
          <label htmlFor="priceNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Price Notes
          </label>
          <textarea
            id="priceNotes"
            rows={3}
            {...register('pricing.priceNotes')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Per person, All inclusive, Based on double occupancy..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Add any additional pricing information or terms
          </p>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Pricing Preview</h4>
        <div className="text-2xl font-bold text-blue-800">
          <span className="text-sm font-normal">Total: </span>
          <span>₹ --,---</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          This is how the price will appear in the PDF proposal
        </p>
      </div>

      {/* Quick Price Templates */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Price Templates</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            type="button"
            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => {
              // These will be handled by parent component later
              console.log('Set price template: Budget');
            }}
          >
            Budget (₹25K)
          </button>
          <button
            type="button"
            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => {
              console.log('Set price template: Standard');
            }}
          >
            Standard (₹50K)
          </button>
          <button
            type="button"
            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => {
              console.log('Set price template: Premium');
            }}
          >
            Premium (₹75K)
          </button>
          <button
            type="button"
            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => {
              console.log('Set price template: Luxury');
            }}
          >
            Luxury (₹100K)
          </button>
        </div>
      </div>
    </div>
  );
}