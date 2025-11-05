/**
 * Server entry point
 * Starts the Express server
 */

import app from './app.js';
import { SERVER_CONFIG } from './config/constants.js';

app.listen(SERVER_CONFIG.PORT, SERVER_CONFIG.HOST, () => {
  console.log(`Proxy server running at http://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}`);
});
