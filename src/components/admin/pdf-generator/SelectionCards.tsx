// src/components/admin/pdf-generator/SelectionCards.tsx
'use client';

import { FileText, Database } from 'lucide-react';

interface SelectionCardsProps {
  onSelectType: (type: 'scratch' | 'prepopulated') => void;
}

export default function SelectionCards({ onSelectType }: SelectionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Generate from Scratch Card */}
      <div 
        className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-blue-300"
        onClick={() => onSelectType('scratch')}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Generate from Scratch
          </h3>
          <p className="text-gray-600 mb-6">
            Create a completely custom travel proposal with full manual entry
          </p>
          
          <ul className="text-sm text-gray-600 mb-6 space-y-2 text-left">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Full manual entry
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Complete flexibility
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Custom itinerary
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Personalized content
            </li>
          </ul>
          
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200">
            Start from Scratch
          </button>
        </div>
      </div>

      {/* Pre-populate from Database Card */}
      <div 
        className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-green-300"
        onClick={() => onSelectType('prepopulated')}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Database className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Pre-populate from Database
          </h3>
          <p className="text-gray-600 mb-6">
            Start with existing package data and customize as needed
          </p>
          
          <ul className="text-sm text-gray-600 mb-6 space-y-2 text-left">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Select destination & package
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Auto-fill all details
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Edit as needed
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Faster generation
            </li>
          </ul>
          
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200">
            Pre-populate Data
          </button>
        </div>
      </div>
    </div>
  );
}