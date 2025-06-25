// src/hooks/usePackages.ts
'use client';

import { useState, useEffect } from 'react';
import { TourPackage } from '@/types/pdf-generator.types';

interface UsePackagesReturn {
  packages: TourPackage[];
  loading: boolean;
  error: string | null;
  fetchPackages: (destinationId: string) => void;
  clearPackages: () => void;
}

export function usePackages(): UsePackagesReturn {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async (destinationId: string) => {
    if (!destinationId) {
      setPackages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/packages?destination_id=${destinationId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch packages');
      }
      
      setPackages(data.packages || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch packages';
      setError(errorMessage);
      console.error('Error fetching packages:', err);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const clearPackages = () => {
    setPackages([]);
    setError(null);
    setLoading(false);
  };

  return {
    packages,
    loading,
    error,
    fetchPackages,
    clearPackages
  };
}