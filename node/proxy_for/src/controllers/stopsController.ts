/**
 * Stops controller
 * Handles stop-related endpoints
 */

import type { Request, Response } from 'express';
import { getStopsFromDB, getStopsByRoute } from '../utils/stopsUtils.js';

/**
 * GET /stops
 * Returns all stops
 */
export async function getAllStops(req: Request, res: Response): Promise<void> {
  try {
    const stops = await getStopsFromDB();
    res.json(stops);
  } catch (err) {
    console.error('Error fetching stops:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    });
  }
}

/**
 * GET /route/stops
 * Returns stops for a specific route
 */
export async function getRouteStops(req: Request, res: Response): Promise<void> {
  const { line, destination, type } = req.query;

  if (!line || !destination || !type) {
    res.status(400).json({ error: 'Missing line, destination, or type query param' });
    return;
  }

  try {
    const stops = await getStopsByRoute({
      line: String(line),
      destination: String(destination),
      type: String(type),
    });
    res.json(stops);
  } catch (err) {
    console.error('Error fetching route stops:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    });
  }
}
