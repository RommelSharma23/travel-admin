// src/components/admin/pdf-generator/DestinationSelector.tsx
'use client';

import { useDestinations } from '../../../hooks/useDestinations';

interface DestinationSelectorProps {
  onDestinationSelect: (destinationId: string) => void;
  selectedDestinationId?: string;
}

export default function DestinationSelector({ 
  onDestinationSelect, 
  selectedDestinationId 
}: DestinationSelectorProps) {
  const { destinations, loading, error } = useDestinations();

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Destination
        </label>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md border"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Destination
        </label>
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
        Destination <span className="text-red-500">*</span>
      </label>
      <select
        id="destination"
        value={selectedDestinationId || ''}
        onChange={(e) => onDestinationSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a destination...</option>
        {destinations.map((destination) => (
          <option key={destination.id} value={destination.id.toString()}>
            {destination.name}, {destination.country}
          </option>
        ))}
      </select>
      {destinations.length === 0 && !loading && (
        <p className="text-sm text-gray-500">No destinations available</p>
      )}
    </div>
  );
}