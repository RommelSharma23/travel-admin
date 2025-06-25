// src/components/admin/pdf-generator/PDFForm/AdditionalInfoSection.tsx
'use client';

import { UseFormRegister } from 'react-hook-form';
import { PDFFormData } from '../../../../types/pdf-generator.types';
import { useState } from 'react';
import { FileText, Info } from 'lucide-react';

interface AdditionalInfoSectionProps {
  register: UseFormRegister<PDFFormData>;
}

export default function AdditionalInfoSection({ register }: AdditionalInfoSectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const termsTemplates = [
    {
      name: 'Standard Terms',
      content: `Terms & Conditions:
• Payment: 50% advance required at booking, balance 30 days before travel
• Cancellation: 30 days - 50% refund, 15-29 days - 25% refund, less than 15 days - no refund
• Travel Insurance: Highly recommended and not included in package price
• Valid passport required with minimum 6 months validity
• Prices subject to change due to currency fluctuations or government tax changes
• Company not responsible for delays due to weather, strikes, or force majeure
• All disputes subject to local jurisdiction`
    },
    {
      name: 'International Travel',
      content: `International Travel Terms:
• Valid passport with minimum 6 months validity required
• Visa requirements are passenger's responsibility
• Travel insurance mandatory for international travel
• Currency exchange rates may affect final pricing
• International flight bookings subject to airline terms
• Medical clearance may be required for certain destinations
• Customs and immigration compliance is passenger's responsibility
• Emergency contact details must be provided before departure`
    },
    {
      name: 'Group Travel',
      content: `Group Travel Terms:
• Minimum group size: 4 persons, maximum varies by package
• Group rates valid for confirmed numbers only
• Single supplement charges apply for solo travelers
• Group leader responsibilities include coordination and communication
• Itinerary may be adjusted based on group preferences and local conditions
• Group discount applicable for bookings of 10 or more
• Special dietary requirements must be informed in advance
• Group travel insurance recommended for all participants`
    }
  ];

  const applyTemplate = (content: string) => {
    const textarea = document.getElementById('termsConditions') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = content;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
      
      <div className="space-y-6">
        {/* Terms & Conditions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="termsConditions" className="block text-sm font-medium text-gray-700">
              Terms & Conditions
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  if (e.target.value) {
                    const template = termsTemplates.find(t => t.name === e.target.value);
                    if (template) {
                      applyTemplate(template.content);
                    }
                  }
                }}
                className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Load Template...</option>
                {termsTemplates.map((template) => (
                  <option key={template.name} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            id="termsConditions"
            rows={8}
            {...register('additionalInfo.termsConditions')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter terms and conditions for this travel package..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Include payment terms, cancellation policy, and important travel conditions
          </p>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            rows={4}
            {...register('additionalInfo.additionalNotes')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional information, special notes, or recommendations for the customer..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Add any extra information, tips, or special instructions
          </p>
        </div>

        {/* Quick Notes Templates */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Notes Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                const textarea = document.getElementById('additionalNotes') as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = `Best Time to Visit: October to March for pleasant weather
Recommended Packing: Light cotton clothes, sunscreen, comfortable walking shoes
Local Currency: Indian Rupee (INR), USD widely accepted
Time Zone: GMT +5:30
Emergency Contact: +91-XXXXXXXXXX (24/7 support)`;
                  textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }}
              className="p-3 text-left bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Travel Tips</div>
                  <div className="text-xs text-gray-500">Best time, packing, currency info</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                const textarea = document.getElementById('additionalNotes') as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = `Health & Safety:
• Travel insurance highly recommended
• Consult doctor for required vaccinations
• Carry personal medications with prescriptions
• Stay hydrated and use sunscreen
• Follow local customs and dress codes
• Keep emergency contacts handy`;
                  textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }}
              className="p-3 text-left bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Health & Safety</div>
                  <div className="text-xs text-gray-500">Important health and safety information</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                const textarea = document.getElementById('additionalNotes') as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = `What to Expect:
• Professional English-speaking guide throughout the tour
• Comfortable, air-conditioned transportation
• Handpicked accommodations with modern amenities
• Authentic local cuisine experiences
• Small group size for personalized attention
• 24/7 customer support during travel`;
                  textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }}
              className="p-3 text-left bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">What to Expect</div>
                  <div className="text-xs text-gray-500">Service quality and experience details</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                const textarea = document.getElementById('additionalNotes') as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = `Contact Information:
• Booking Office: +91 7877995497
• Email: info@getawayvibe.com
• Website: www.getawayvibe.com
• WhatsApp Support: +91 7877995497

We're here to make your journey memorable and hassle-free!`;
                  textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }}
              className="p-3 text-left bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Contact Info</div>
                  <div className="text-xs text-gray-500">Support and contact details</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Important Information Box */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Important Reminder</h4>
              <p className="text-sm text-yellow-700">
                Make sure to review all terms and conditions before generating the PDF. 
                These will be legally binding once the proposal is sent to the customer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}