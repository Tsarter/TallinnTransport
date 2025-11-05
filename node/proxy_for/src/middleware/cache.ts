/**
 * Cache middleware configuration
 */

import apicache from 'apicache';

// Configure apicache defaults
apicache.options({
  headers: {
    'Cache-Control': 'public, max-age=10'
  }
});

// Clear any existing cache on startup
apicache.clear();

// Export configured cache middleware
export const cache = apicache.middleware;
