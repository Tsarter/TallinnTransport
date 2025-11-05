/**
 * Interruptions service
 * Handles fetching service interruption data
 */

import { EXTERNAL_URLS } from '../config/constants.js';

/**
 * Fetch service interruptions data
 */
export async function getInterruptions(): Promise<string> {
  const response = await fetch(EXTERNAL_URLS.INTERRUPTIONS);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Interruptions data file not found');
    }
    throw new Error('Failed to fetch interruptions data');
  }

  return await response.text();
}
