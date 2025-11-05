/**
 * Custom hook for fetching and managing stop data
 * Fetches once and caches (stops don't change frequently)
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useMapStore } from '../store/mapStore';
import { fetchStops } from '../shared/api';
import type { Stop } from '../types';

export function useStops() {
  const setStops = useMapStore((state) => state.setStops);
  const setError = useMapStore((state) => state.setError);

  // Use React Query for data fetching - only fetch once
  const { data: stopsArray, error, isLoading } = useQuery({
    queryKey: ['stops'],
    queryFn: async () => {
      const stops = await fetchStops();
      return stops as Stop[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours in ms
    gcTime: 1000 * 60 * 60 * 24, // 24 hours in ms
  });

  // Update Zustand store when stops change
  useEffect(() => {
    if (stopsArray) {
      // Convert array to map for easier lookup
      const stopsMap: Record<string, Stop> = {};
      stopsArray.forEach((stop) => {
        stopsMap[stop.stop_id] = stop;
      });
      setStops(stopsMap);
    }
  }, [stopsArray, setStops]);

  // Show error in snackbar when fetch fails
  useEffect(() => {
    if (error) {
      setError(`Failed to fetch stops: ${(error as Error).message}`);
    }
  }, [error, setError]);

  return {
    stops: stopsArray || [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
