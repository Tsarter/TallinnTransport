/**
 * Express application setup
 */

import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// Middleware
app.use(cors());

// Routes
app.use('/', routes);

export default app;
