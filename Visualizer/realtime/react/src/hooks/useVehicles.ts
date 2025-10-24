/**
 * Custom hook for fetching and managing real-time vehicle GPS data
 * Uses TanStack Query for automatic refetching every 6 seconds
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useMapStore } from '../store/mapStore';
import { fetchGPSData, parseGPSData } from '../../../shared/api.js';
import type { Vehicle } from '../types';

const UPDATE_INTERVAL = 6000; // 6 seconds

export function useVehicles() {
  const setVehicles = useMapStore((state) => state.setVehicles);
  const setLastUpdate = useMapStore((state) => state.setLastUpdate);

  // Use React Query for data fetching with automatic refetching
  const { data: vehicles, error, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      // Skip if document is hidden (handled by React Query automatically)
      if (document.hidden) {
        return null;
      }

      const csvData = await fetchGPSData();
      const parsedVehicles = parseGPSData(csvData);

      // Convert array to map for easier lookup
      const vehicleMap: Record<string, Vehicle> = {};
      parsedVehicles.forEach((vehicle: Vehicle) => {
        vehicleMap[vehicle.key] = vehicle;
      });

      return vehicleMap;
    },
    refetchInterval: UPDATE_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: UPDATE_INTERVAL - 1000, // Consider stale after 5 seconds
  });

  // Update Zustand store when vehicles change
  useEffect(() => {
    if (vehicles) {
      const timestamp = Date.now();
      setVehicles(vehicles);
      setLastUpdate(timestamp);
    }
  }, [vehicles, setVehicles, setLastUpdate]);

  return {
    vehicles: vehicles || {},
    isLoading,
    error: error ? (error as Error).message : null,
    lastUpdate: useMapStore((state) => state.lastUpdate),
  };
}
