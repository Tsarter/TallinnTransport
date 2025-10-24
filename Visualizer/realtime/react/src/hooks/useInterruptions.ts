/**
 * Custom hook for fetching service interruptions
 * Updates when data changes or on mount
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useMapStore } from '../store/mapStore';
import { fetchInterruptions } from '../../../shared/api.js';
import { parseInterruptions } from '../../../shared/utils.js';

export function useInterruptions() {
  const setInterruptions = useMapStore((state) => state.setInterruptions);

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

  return {
    interruptions: data || {},
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
