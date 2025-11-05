/**
 * GPS controller
 * Handles GPS data endpoint
 */

import type { Request, Response } from 'express';
import { getCombinedGPSData } from '../services/gpsService.js';

/**
 * GET /gps
 * Returns combined GPS data from TLT and Elron sources
 */
export async function getGPSData(req: Request, res: Response): Promise<void> {
  try {
    const gpsData = await getCombinedGPSData();
    res.send(gpsData);
  } catch (error) {
    console.error('Error in GPS controller:', error);
    res.status(500).send('Internal server error');
  }
}
