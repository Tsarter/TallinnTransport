/**
 * VehiclesLayer component manages all vehicle markers
 * Handles fetching, animation timing, and rendering
 */

import { useMemo } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useInterruptions } from '../hooks/useInterruptions';
import { VehicleMarker } from './VehicleMarker';
import { useMapStore } from '../store/mapStore';

export function VehiclesLayer() {
  const { vehicles, isLoading, error } = useVehicles();
  useInterruptions(); // Initialize interruptions (stored in Zustand)
  const lastUpdate = useMapStore((state) => state.lastUpdate);

  // Determine if we should animate markers
  // Memoize to prevent recalculation on every render
  const shouldAnimate = useMemo(() => {
    if (lastUpdate === 0) return false;
    return Date.now() - lastUpdate < 15000;
  }, [lastUpdate]);

  if (error) {
    console.error('Error loading vehicles:', error);
  }

  if (isLoading && Object.keys(vehicles).length === 0) {
    // Initial loading, don't render anything yet
    return null;
  }

  return (
    <>
      {Object.values(vehicles).map((vehicle) => (
        <VehicleMarker
          key={vehicle.key}
          vehicle={vehicle}
          shouldAnimate={shouldAnimate}
        />
      ))}
    </>
  );
}
