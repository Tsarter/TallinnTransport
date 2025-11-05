/**
 * Route controller
 * Handles route-related endpoints
 */

import type { Request, Response } from 'express';
import { getRouteCoordinatesFromDB } from '../utils/routeUtils.js';

/**
 * GET /route
 * Returns route coordinates for a specific line, destination, and type
 */
export async function getRouteCoordinates(req: Request, res: Response): Promise<void> {
  const { line, destination, type } = req.query;

  if (!line || !destination || !type) {
    res.status(400).json({ error: 'Missing line, destination, or type query param' });
    return;
  }

  try {
    const coords = await getRouteCoordinatesFromDB({
      line: String(line),
      destination: String(destination),
      type: String(type),
    });
    res.json(coords);
  } catch (err) {
    console.error('Error fetching route coordinates:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    });
  }
}
