/**
 * Zustand store for managing global map state
 */

import { create } from 'zustand';
import type { Vehicle, Stop, Interruption, RouteSelection, UserLocation, DeviceType } from '../types';

interface MapState {
  // Vehicle data
  vehicles: Record<string, Vehicle>;
  setVehicles: (vehicles: Record<string, Vehicle>) => void;
  updateVehicle: (key: string, vehicle: Vehicle) => void;
  removeVehicle: (key: string) => void;

  // Stop data
  stops: Record<string, Stop>;
  setStops: (stops: Record<string, Stop>) => void;

  // Selected stop
  selectedStop: Stop | null;
  setSelectedStop: (stop: Stop | null) => void;

  // Selected route
  selectedRoute: RouteSelection;
  setSelectedRoute: (route: RouteSelection) => void;

  // Interruptions
  interruptions: Record<string, Interruption>;
  setInterruptions: (interruptions: Record<string, Interruption>) => void;

  // User location
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;

  // Device type
  deviceType: DeviceType;
  setDeviceType: (type: DeviceType) => void;

  // Map zoom level
  zoom: number;
  setZoom: (zoom: number) => void;

  // Last update timestamp
  lastUpdate: number;
  setLastUpdate: (timestamp: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  vehicles: {},
  stops: {},
  selectedStop: null,
  selectedRoute: { type: null, line: null, destination: null },
  interruptions: {},
  userLocation: null,
  deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
  zoom: 13,
  lastUpdate: 0,

  // Actions
  setVehicles: (vehicles) => set({ vehicles }),

  updateVehicle: (key, vehicle) =>
    set((state) => ({
      vehicles: {
        ...state.vehicles,
        [key]: vehicle,
      },
    })),

  removeVehicle: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.vehicles;
      return { vehicles: rest };
    }),

  setStops: (stops) => set({ stops }),

  setSelectedStop: (selectedStop) => set({ selectedStop }),

  setSelectedRoute: (selectedRoute) => set({ selectedRoute }),

  setInterruptions: (interruptions) => set({ interruptions }),

  setUserLocation: (userLocation) => set({ userLocation }),

  setDeviceType: (deviceType) => set({ deviceType }),

  setZoom: (zoom) => set({ zoom }),

  setLastUpdate: (lastUpdate) => set({ lastUpdate }),
}));
