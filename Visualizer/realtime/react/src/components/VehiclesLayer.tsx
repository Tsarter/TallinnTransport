/**
 * VehiclesLayer component manages all vehicle markers
 * Handles fetching, animation timing, and rendering
 */

import { useVehicles } from '../hooks/useVehicles';
import { useInterruptions } from '../hooks/useInterruptions';
import { VehicleMarker } from './VehicleMarker';
import { useMapStore } from '../store/mapStore';

export function VehiclesLayer() {
  const { vehicles, isLoading, error } = useVehicles();
  useInterruptions(); // Initialize interruptions (stored in Zustand)
  const lastUpdate = useMapStore((state) => state.lastUpdate);

  // Determine if we should animate markers
  // Always animate once we have initial data, but skip animation
  // if user returns after being away (> 15 seconds gap)
  const shouldAnimate = lastUpdate === 0 ? false : Date.now() - lastUpdate < 15000;

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
