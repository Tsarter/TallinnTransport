/**
 * Type declarations for shared API module
 */

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

export function fetchStops(): Promise<any[]>;
export function fetchStopDepartures(stopId: string, limit?: number): Promise<any[]>;
export function fetchRealtimeStopDepartures(stopId: string, limit?: number): Promise<any[]>;
export function fetchGPSData(): Promise<string>;
export function fetchRouteData(vehicleType: string | number, lineNumber: string, destination: string): Promise<any[]>;
export function fetchRouteStops(vehicleType: string | number, lineNumber: string, destination: string): Promise<any[]>;
export function fetchInterruptions(): Promise<any[]>;
export function parseGPSData(csvData: string): Vehicle[];
