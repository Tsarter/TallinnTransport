/**
 * GPS data fetching service
 * Handles fetching and combining TLT (Tallinn) and Elron (trains) GPS data
 */

import { CACHE_DURATIONS, TIMEOUTS, EXTERNAL_URLS } from '../config/constants.js';
import { mapElronTrainsToCsv } from '../utils/mapper.js';
import type { ElronApiResponse } from '../utils/types.js';

// Cache for Elron train data (to avoid rate limiting)
let elronCache: { data: string; timestamp: number } | null = null;

/**
 * Fetch TLT (Tallinn public transport) GPS data
 */
async function fetchTLTData(): Promise<string> {
  const time = Date.now();
  const tltUrl = `${EXTERNAL_URLS.TLT_GPS}?${time}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUTS.TLT_FETCH);

  try {
    const response = await fetch(tltUrl, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`TLT API returned status ${response.status}`);
    }

    return await response.text();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('TLT fetch request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch Elron (train) GPS data with caching
 */
async function fetchElronData(): Promise<string> {
  const now = Date.now();

  // Check if cache is valid
  if (elronCache && (now - elronCache.timestamp) <= CACHE_DURATIONS.ELRON) {
    return elronCache.data;
  }

  // Fetch new data
  const time = Date.now();
  const elronUrl = `${EXTERNAL_URLS.ELRON_API}?nocache=${time}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUTS.ELRON_FETCH);

  try {
    const response = await fetch(elronUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Elron API returned status ${response.status}`);
      return elronCache?.data || '';
    }

    const text = await response.text();

    if (!text || text.length === 0) {
      console.warn('Elron API returned empty response');
      return elronCache?.data || '';
    }

    const elronJson = JSON.parse(text) as ElronApiResponse;

    if (elronJson.status !== 1 || !elronJson.data || elronJson.data.length === 0) {
      console.warn('Elron API returned no data');
      return elronCache?.data || '';
    }

    const elronCsv = mapElronTrainsToCsv(elronJson.data);

    // Update cache
    elronCache = { data: elronCsv, timestamp: now };

    return elronCsv;
  } catch (err) {
    console.error('Error fetching Elron data:', err);
    // Return cached data if available
    return elronCache?.data || '';
  }
}

/**
 * Fetch and combine TLT and Elron GPS data
 */
export async function getCombinedGPSData(): Promise<string> {
  // Fetch both sources in parallel
  const [tltData, elronData] = await Promise.all([
    fetchTLTData(),
    fetchElronData().catch(err => {
      console.error('Elron fetch failed:', err);
      return ''; // Don't fail the whole request if Elron fails
    }),
  ]);

  // Combine data
  if (elronData) {
    return `${tltData.trimEnd()}\n${elronData}`;
  }

  return tltData;
}
