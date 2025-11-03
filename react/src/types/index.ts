/**
 * TypeScript type definitions for the realtime transport visualizer
 */

export interface Stop {
  stop_id: string;
  stop_name: string;
  lat: number;
  lon: number;
  thoreb_id: string;
}

export interface Departure {
  route_id: string;
  route_short_name: string;
  trip_headsign: string;
  departure_time: string;
  scheduled_time: string;
  is_realtime: boolean;
}

export interface Vehicle {
  type: number;
  lineNum: string;
  lat: number;
  lon: number;
  direction: number;
  vehicleId: number;
  tripId: string;
  destination: string;
  key: string;
}

export interface Interruption {
  transport: string;
  route: string;
  destination: string;
  start_time: string;
  announcement: string;
  info: string;
}

export interface InterruptionCheck {
  announcement: string;
  ongoingInterruption: boolean;
}

export interface RouteSelection {
  type: number | null;
  line: string | null;
  destination: string | null;
}

export type VehicleType = 2 | 3 | 7 | 10;

export type DeviceType = 'Mobile' | 'Desktop';

export interface UserLocation {
  lat: number;
  lon: number;
  heading: number | null; // Direction in degrees (0-360), null if unavailable
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
