/**
 * Interruptions controller
 * Handles service interruption endpoints
 */

import type { Request, Response } from 'express';
import { getInterruptions } from '../services/interruptionsService.js';

/**
 * GET /interruptions
 * Returns service interruption data
 */
export async function getServiceInterruptions(req: Request, res: Response): Promise<void> {
  try {
    const data = await getInterruptions();
    res.type('application/json').send(data);
  } catch (err) {
    console.error('Error fetching interruptions:', err);

    if (err instanceof Error && err.message.includes('not found')) {
      res.status(404).json({ error: err.message });
      return;
    }

    res.status(500).json({ error: 'Something went wrong' });
  }
}
