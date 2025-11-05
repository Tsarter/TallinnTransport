/**
 * API routes configuration
 */

import { Router } from 'express';
import { cache } from '../middleware/cache.js';
import { CACHE_DURATIONS } from '../config/constants.js';

// Controllers
import { getGPSData } from '../controllers/gpsController.js';
import { getRouteCoordinates } from '../controllers/routeController.js';
import { getAllStops, getRouteStops } from '../controllers/stopsController.js';
import { getStopDepartures } from '../controllers/departuresController.js';
import { getServiceInterruptions } from '../controllers/interruptionsController.js';

const router = Router();

// GPS endpoint
router.get('/gps', cache(CACHE_DURATIONS.GPS), getGPSData);

// Route endpoints
router.get('/route', cache(CACHE_DURATIONS.ROUTE), getRouteCoordinates);
router.get('/route/stops', cache(CACHE_DURATIONS.ROUTE_STOPS), getRouteStops);

// Stop endpoints
router.get('/stops', getAllStops);
router.get('/stops/:stopThorebId/departures', getStopDepartures);

// Interruptions endpoint
router.get('/interruptions', getServiceInterruptions);

export default router;
