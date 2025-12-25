/**
 * PDF Service - Express server for PDF generation
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { processPdfJob } from './jobs/process-pdf-job';
import { pdfJobSchema } from '@rulequote/schemas';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Process PDF job endpoint
app.post('/api/process', async (req, res) => {
  try {
    const job = pdfJobSchema.parse(req.body);
    const filePath = await processPdfJob(job);
    res.json({ success: true, filePath, jobId: job.jobId });
  } catch (error) {
    console.error('Error processing PDF job:', error);
    res.status(400).json({ error: 'Failed to process PDF job' });
  }
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to PDF Service!' });
});

const port = process.env.PORT || 3334;
const server = app.listen(port, () => {
  console.log(`📄 PDF service listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
