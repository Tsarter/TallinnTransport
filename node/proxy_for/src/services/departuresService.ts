/**
 * Departures service
 * Handles fetching and merging realtime and scheduled departure data
 */

import { TIMEOUTS, EXTERNAL_URLS } from '../config/constants.js';
import { getNextDeparturesByStopThorebId } from '../utils/stopsUtils.js';
import { mapTallinnLiveDeparturesResponseToJson } from '../utils/mapper.js';

interface Departure {
  departure_time: string;
  trip_headsign: string;
  is_realtime?: boolean;
  [key: string]: any;
}

/**
 * Fetch realtime departure data from Tallinn API
 */
async function fetchRealtimeDepartures(stopThorebId: number): Promise<any[]> {
  const url = `${EXTERNAL_URLS.TALLINN_DEPARTURES}?stopid=${stopThorebId}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUTS.DEPARTURE_FETCH);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      return [];
    }

    const text = await response.text();
    return mapTallinnLiveDeparturesResponseToJson(text);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('Realtime departures fetch timed out');
    } else {
      console.error('Error fetching realtime departures:', err);
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Filter out past departures (unless they have realtime data)
 */
function filterPastDepartures(departures: Departure[]): Departure[] {
  const now = new Date();

  return departures.filter((dep) => {
    const [hours = '0', minutes = '0', seconds = '0'] = dep.departure_time.split(':');
    const departureTime = new Date();
    departureTime.setHours(
      parseInt(hours, 10),
      parseInt(minutes, 10),
      parseInt(seconds, 10),
      0
    );

    // Keep realtime departures even if they're in the past
    if (dep.is_realtime) {
      return true;
    }

    // Filter out past scheduled departures
    return departureTime >= now;
  });
}

/**
 * Get departures for a stop, merging scheduled and realtime data
 */
export async function getDeparturesForStop(
  stopThorebId: number,
  limit: number
): Promise<Departure[]> {
  // Fetch scheduled and realtime data in parallel
  const [scheduledDepartures, realtimeDepartures] = await Promise.all([
    getNextDeparturesByStopThorebId(stopThorebId),
    fetchRealtimeDepartures(stopThorebId),
  ]);

  // Merge realtime data with scheduled data
  const mergedDepartures = scheduledDepartures.map((departure) => {
    const realtimeDep = realtimeDepartures.find(
      (rtDep) =>
        rtDep.scheduleTime === departure.departure_time &&
        rtDep.destination === departure.trip_headsign
    );

    return {
      ...departure,
      departure_time: realtimeDep ? realtimeDep.expectedTime : departure.departure_time,
      is_realtime: !!realtimeDep,
    };
  });

  // Filter out past departures and apply limit
  const filteredDepartures = filterPastDepartures(mergedDepartures);

  return filteredDepartures.slice(0, limit);
}
