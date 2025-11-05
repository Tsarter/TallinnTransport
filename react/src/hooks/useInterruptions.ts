/**
 * Custom hook for fetching service interruptions
 * Updates when data changes or on mount
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useMapStore } from '../store/mapStore';
import { fetchInterruptions } from '../shared/api';
import { parseInterruptions } from '../shared/utils';

export function useInterruptions() {
  const setInterruptions = useMapStore((state) => state.setInterruptions);
  const setError = useMapStore((state) => state.setError);

  const { data, error, isLoading } = useQuery({
    queryKey: ['interruptions'],
    queryFn: async () => {
      const rawInterruptions = await fetchInterruptions();
      return parseInterruptions(rawInterruptions);
    },
    staleTime: 5 * 60 * 1000, // Consider stale after 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Update Zustand store when interruptions change
  useEffect(() => {
    if (data) {
      setInterruptions(data);
    }
  }, [data, setInterruptions]);

  // Show error in snackbar when fetch fails (but don't block the app)
  useEffect(() => {
    if (error) {
      setError(`Failed to fetch service interruptions: ${(error as Error).message}`);
    }
  }, [error, setError]);

  return {
    interruptions: data || {},
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
