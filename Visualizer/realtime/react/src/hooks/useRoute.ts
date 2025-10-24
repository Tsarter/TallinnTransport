/**
 * Custom hook for fetching route geometry
 * Fetches route polyline coordinates when a route is selected
 */

import { useQuery } from '@tanstack/react-query';
import { useMapStore } from '../store/mapStore';
import { fetchRouteData } from '../../../shared/api.js';
import type { LatLngExpression } from 'leaflet';

export function useRoute() {
  const selectedRoute = useMapStore((state) => state.selectedRoute);

  // Only fetch if a route is selected
  const { data: routeCoordinates, isLoading, error } = useQuery({
    queryKey: ['route', selectedRoute.type, selectedRoute.line, selectedRoute.destination],
    queryFn: async () => {
      if (!selectedRoute.type || !selectedRoute.line || !selectedRoute.destination) {
        return null;
      }

      const coords = await fetchRouteData(
        selectedRoute.type,
        selectedRoute.line,
        selectedRoute.destination
      );
      return coords as LatLngExpression[];
    },
    enabled: !!(selectedRoute.type && selectedRoute.line && selectedRoute.destination),
    staleTime: 1000 * 60 * 60, // 1 hour - routes can change daily
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
  });

  return {
    routeCoordinates: routeCoordinates || null,
    isLoading,
    error: error ? (error as Error).message : null,
    hasRoute: !!(selectedRoute.type && selectedRoute.line && selectedRoute.destination),
  };
}
