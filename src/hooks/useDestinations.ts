// src/hooks/useDestinations.ts
'use client';

import { useState, useEffect } from 'react';
import { Destination } from '../types/pdf-generator.types';

interface UseDestinationsReturn {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDestinations(): UseDestinationsReturn {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/destinations');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch destinations');
      }
      
      setDestinations(data.destinations || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch destinations';
      setError(errorMessage);
      console.error('Error fetching destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  return {
    destinations,
    loading,
    error,
    refetch: fetchDestinations
  };
}