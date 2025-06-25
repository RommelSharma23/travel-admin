// src/components/admin/pdf-generator/PDFForm/CustomerInfoSection.tsx
'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { PDFFormData } from '../../../../types/pdf-generator.types';

interface CustomerInfoSectionProps {
  register: UseFormRegister<PDFFormData>;
  errors: FieldErrors<PDFFormData>;
}

export default function CustomerInfoSection({ register, errors }: CustomerInfoSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Name */}
        <div className="md:col-span-2">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="customerName"
            {...register('customerInfo.customerName', { 
              required: 'Customer name is required' 
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.customerInfo?.customerName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter customer name"
          />
          {errors.customerInfo?.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerInfo.customerName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register('customerInfo.email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="customer@example.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            {...register('customerInfo.phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Total Travelers */}
        <div>
          <label htmlFor="totalTravelers" className="block text-sm font-medium text-gray-700 mb-1">
            Total Travelers <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="totalTravelers"
            min="1"
            {...register('customerInfo.totalTravelers', { 
              required: 'Number of travelers is required',
              min: { value: 1, message: 'At least 1 traveler is required' }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.customerInfo?.totalTravelers ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="2"
          />
          {errors.customerInfo?.totalTravelers && (
            <p className="mt-1 text-sm text-red-600">{errors.customerInfo.totalTravelers.message}</p>
          )}
        </div>

        {/* Travel Start Date */}
        <div>
          <label htmlFor="travelStartDate" className="block text-sm font-medium text-gray-700 mb-1">
            Travel Start Date
          </label>
          <input
            type="date"
            id="travelStartDate"
            {...register('customerInfo.travelStartDate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Travel End Date */}
        <div>
          <label htmlFor="travelEndDate" className="block text-sm font-medium text-gray-700 mb-1">
            Travel End Date
          </label>
          <input
            type="date"
            id="travelEndDate"
            {...register('customerInfo.travelEndDate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Special Requirements */}
        <div className="md:col-span-2">
          <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
            Special Requirements
          </label>
          <textarea
            id="specialRequirements"
            rows={3}
            {...register('customerInfo.specialRequirements')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any dietary restrictions, accessibility needs, or special requests..."
          />
        </div>
      </div>
    </div>
  );
}