/**
 * Custom hook for fetching stops for a selected route
 * Fetches stop IDs when a route is selected
 */

import { useQuery } from '@tanstack/react-query';
import { useMapStore } from '../store/mapStore';
import { fetchRouteStops } from '../../../shared/api.js';
import type { Stop } from '../types';

export function useRouteStops() {
  const selectedRoute = useMapStore((state) => state.selectedRoute);

  // Only fetch if a route is selected
  const { data: routeStops, isLoading, error } = useQuery({
    queryKey: ['route-stops', selectedRoute.type, selectedRoute.line, selectedRoute.destination],
    queryFn: async () => {
      if (!selectedRoute.type || !selectedRoute.line || !selectedRoute.destination) {
        return null;
      }

      const stops = await fetchRouteStops(
        selectedRoute.type,
        selectedRoute.line,
        selectedRoute.destination
      );
      return stops as Stop[];
    },
    enabled: !!(selectedRoute.type && selectedRoute.line && selectedRoute.destination),
    staleTime: 1000 * 60 * 60, // 1 hour - routes can change daily
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
  });

  return {
    routeStops: routeStops || null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
