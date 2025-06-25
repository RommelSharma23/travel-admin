// src/components/admin/pdf-generator/PackageSelector.tsx
'use client';

import { useEffect } from 'react';
import { usePackages } from '../../../hooks/usePackages';

interface PackageSelectorProps {
  destinationId: string;
  onPackageSelect: (packageId: string) => void;
  selectedPackageId?: string;
}

export default function PackageSelector({ 
  destinationId,
  onPackageSelect, 
  selectedPackageId 
}: PackageSelectorProps) {
  const { packages, loading, error, fetchPackages, clearPackages } = usePackages();

  useEffect(() => {
    if (destinationId) {
      fetchPackages(destinationId);
    } else {
      clearPackages();
    }
  }, [destinationId]);

  if (!destinationId) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Package
        </label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
          Please select a destination first
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Package
        </label>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md border"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Package
        </label>
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="package" className="block text-sm font-medium text-gray-700">
        Package <span className="text-red-500">*</span>
      </label>
      <select
        id="package"
        value={selectedPackageId || ''}
        onChange={(e) => onPackageSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a package...</option>
        {packages.map((pkg) => (
          <option key={pkg.id} value={pkg.id.toString()}>
            {pkg.title} ({pkg.duration_days} Days/{pkg.duration_nights} Nights) - 
            {pkg.currency} {pkg.price_from ? pkg.price_from.toLocaleString() : 'Price on request'}
          </option>
        ))}
      </select>
      {packages.length === 0 && !loading && (
        <p className="text-sm text-gray-500">No packages available for this destination</p>
      )}
    </div>
  );
}