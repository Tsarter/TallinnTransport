/**
 * Custom hook for fetching and managing stop data
 * Fetches once and caches (stops don't change frequently)
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useMapStore } from '../store/mapStore';
import { fetchStops } from '../../../shared/api.js';
import type { Stop } from '../types';

export function useStops() {
  const setStops = useMapStore((state) => state.setStops);

  // Use React Query for data fetching - only fetch once
  const { data: stopsArray, error, isLoading } = useQuery({
    queryKey: ['stops'],
    queryFn: async () => {
      const stops = await fetchStops();
      return stops as Stop[];
    },
    staleTime: Infinity, // Stops don't change, cache forever
    gcTime: Infinity, // Keep in cache forever
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

  return {
    stops: stopsArray || [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
