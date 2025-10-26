/**
 * Custom hook for fetching and managing real-time vehicle GPS data
 * Uses TanStack Query for automatic refetching every 6 seconds
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect, startTransition, useRef } from 'react';
import { useMapStore } from '../store/mapStore';
import { fetchGPSData, parseGPSData } from '../../../shared/api.js';
import type { Vehicle } from '../types';

const UPDATE_INTERVAL = 6000; // 6 seconds

export function useVehicles() {
  const setVehicles = useMapStore((state) => state.setVehicles);
  const setLastUpdate = useMapStore((state) => state.setLastUpdate);
  const lastVisibleTimeRef = useRef<number>(Date.now());

  // Use React Query for data fetching with automatic refetching
  const { data: vehicles, error, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      // Skip if document is hidden
      if (document.hidden) {
        return null;
      }

      const csvData = await fetchGPSData();
      const parsedVehicles = parseGPSData(csvData);

      // Get current vehicles to reuse unchanged references
      const currentVehicles = useMapStore.getState().vehicles;
      const vehicleMap: Record<string, Vehicle> = {};

      // Single pass: convert to map AND reuse unchanged references
      for (const vehicle of parsedVehicles) {
        const currentVehicle = currentVehicles[vehicle.key];

        // Reuse reference if vehicle hasn't changed (prevents re-render)
        if (currentVehicle &&
            currentVehicle.lat === vehicle.lat &&
            currentVehicle.lon === vehicle.lon &&
            currentVehicle.direction === vehicle.direction &&
            currentVehicle.destination === vehicle.destination) {
          vehicleMap[vehicle.key] = currentVehicle;
        } else {
          vehicleMap[vehicle.key] = vehicle;
        }
      }

      return vehicleMap;
    },
    refetchInterval: UPDATE_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: UPDATE_INTERVAL - 1000,
  });

  // Track when page becomes visible/hidden to control animations
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible - update the last visible time
        lastVisibleTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Update Zustand store when vehicles change
  // Use startTransition to mark as non-urgent, keeping UI responsive
  useEffect(() => {
    if (vehicles) {
      const now = Date.now();
      const timeSinceVisible = now - lastVisibleTimeRef.current;

      // If user was away for 15+ seconds, set lastUpdate to 0 to disable animations
      // Otherwise, set it to current time to enable animations
      const timestamp = timeSinceVisible > 15000 ? 0 : now;

      // Mark vehicle updates as low priority
      startTransition(() => {
        setVehicles(vehicles);
        setLastUpdate(timestamp);
      });
    }
  }, [vehicles, setVehicles, setLastUpdate]);

  return {
    vehicles: vehicles || {},
    isLoading,
    error: error ? (error as Error).message : null,
    lastUpdate: useMapStore((state) => state.lastUpdate),
  };
}
