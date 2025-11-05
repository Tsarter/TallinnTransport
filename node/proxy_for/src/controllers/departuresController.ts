/**
 * Departures controller
 * Handles departure-related endpoints
 */

import type { Request, Response } from 'express';
import { getDeparturesForStop } from '../services/departuresService.js';
import { LIMITS } from '../config/constants.js';

/**
 * GET /stops/:stopThorebId/departures
 * Returns departures for a specific stop, merging scheduled and realtime data
 */
export async function getStopDepartures(req: Request, res: Response): Promise<void> {
  try {
    const stopThorebIdParam = req.params.stopThorebId;

    if (!stopThorebIdParam) {
      res.status(400).json({ error: 'Missing stopThorebId' });
      return;
    }

    const stopThorebId = parseInt(stopThorebIdParam, 10);

    if (isNaN(stopThorebId)) {
      res.status(400).json({ error: 'Invalid stopThorebId' });
      return;
    }

    const limitParam = (req.query.limit as string | undefined) || String(LIMITS.DEFAULT_DEPARTURES);
    const limit = Math.min(parseInt(limitParam, 10), LIMITS.MAX_DEPARTURES);

    const departures = await getDeparturesForStop(stopThorebId, limit);

    res.json(departures);
  } catch (err) {
    console.error('Error fetching stop departures:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    });
  }
}
