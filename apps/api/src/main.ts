/**
 * Express API server bootstrap
 */

import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import * as path from 'path';
import { errorHandler } from './middleware/error-handler';
import { logger } from './middleware/logger';
import pdfJobsRouter from './routes/pdf-jobs';
import quotesRouter from './routes/quotes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Rulequote API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      quotes: '/api/quotes',
      pdfJobs: '/api/pdf-jobs',
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/quotes', quotesRouter);
app.use('/api/pdf-jobs', pdfJobsRouter);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Rulequote API!' });
});

// Error handling (must be last)
app.use(errorHandler);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`🚀 API server listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
