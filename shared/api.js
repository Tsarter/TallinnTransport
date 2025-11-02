/**
 * Shared API module for both vanilla JS and React versions
 * Contains all data fetching functions for the realtime transport visualizer
 */

import { API_BASE } from "./constants.js";

/**
 * Fetch all stops from the API
 * @returns {Promise<Array>} Array of stop objects with {stop_id, stop_name, lat, lon}
 */
export async function fetchStops() {
  const response = await fetch(`${API_BASE}/proxy/stops`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stops: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch departure times for a specific stop
 * @param {string} stopId - The stop thoreb ID
 * @param {number} limit - Maximum number of departures to return (default: 10)
 * @returns {Promise<Array>} Array of departure objects
 */
export async function fetchStopDepartures(stopThorebId, limit = 10) {
  const response = await fetch(
    `${API_BASE}/proxy/stops/${stopThorebId}/departures?limit=${limit}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch stop departures: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch real-time departure times for a specific stop
 * @param {string} stopId - The stop ID
 * @param {number} limit - Maximum number of departures to return (default: 10)
 * @returns {Promise<Array>} Array of real-time departure objects
 */
export async function fetchRealtimeStopDepartures(stopId, limit = 10) {
  const response = await fetch(
    `${API_BASE}/proxy/stops/${stopId}/departures/realtime?limit=${limit}`
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch realtime stop departures: ${response.statusText}`
    );
  }
  return response.json();
}

/**
 * Fetch current GPS positions of all vehicles
 * Returns CSV data: type,lineNum,lon,lat,,direction,vehicleId,,tripId,destination
 * @returns {Promise<string>} CSV string of vehicle positions
 */
export async function fetchGPSData() {
  const response = await fetch(`${API_BASE}/proxy/gps`);
  if (!response.ok) {
    throw new Error(`Failed to fetch GPS data: ${response.statusText}`);
  }
  return response.text();
}

/**
 * Fetch route geometry for a specific line
 * @param {string|number} vehicleType - Vehicle type code (2=bus, 3=tram, 10=train)
 * @param {string} lineNumber - Line number (e.g., "1", "23")
 * @param {string} destination - Trip headsign/destination
 * @returns {Promise<Array>} Array of [lat, lon] coordinate pairs
 */
export async function fetchRouteData(vehicleType, lineNumber, destination) {
  const response = await fetch(
    `${API_BASE}/proxy/route?line=${lineNumber}&type=${vehicleType}&destination=${destination}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch route data: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch stops for a specific route
 * @param {string|number} vehicleType - Vehicle type code (2=bus, 3=tram, 10=train)
 * @param {string} lineNumber - Line number (e.g., "1", "23")
 * @param {string} destination - Trip headsign/destination
 * @returns {Promise<Array>} Array of stop objects with {stop_id, stop_name, lat, lon}
 */
export async function fetchRouteStops(vehicleType, lineNumber, destination) {
  const response = await fetch(
    `${API_BASE}/proxy/route/stops?line=${lineNumber}&type=${vehicleType}&destination=${destination}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch route stops: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch service interruptions/alerts
 * @returns {Promise<Array>} Array of interruption objects
 */
export async function fetchInterruptions() {
  const response = await fetch(
    "/transport_data/transport_data/interruptions_data/ongoing.json"
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch interruptions: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Parse GPS CSV data into structured objects
 * @param {string} csvData - Raw CSV string from fetchGPSData()
 * @returns {Array} Array of vehicle objects
 */
export function parseGPSData(csvData) {
  const lines = csvData.trim().split("\n");
  return lines.map((line) => {
    const [
      type,
      lineNum,
      lon,
      lat,
      ,
      direction,
      vehicleId,
      ,
      tripId,
      destination,
    ] = line.split(",");

    return {
      type: parseInt(type),
      lineNum,
      lat: parseFloat(lat) / 1e6,
      lon: parseFloat(lon) / 1e6,
      direction: parseInt(direction),
      vehicleId: parseInt(vehicleId),
      tripId,
      destination,
      key: `${type}-${vehicleId}`,
    };
  });
}
