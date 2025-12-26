import { createPdfJobSchema } from '@rulequote/schemas';
import axios from 'axios';
import { Router } from 'express';

import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/error-handler';

const router = Router();

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:3334/api';

/**
 * GET /api/pdf-jobs
 * Get all PDF jobs
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const jobs = await prisma.pdfJob.findMany({
      include: {
        quote: {
          select: {
            id: true,
            customerName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ jobs });
  })
);

/**
 * GET /api/pdf-jobs/:id
 * Get a single PDF job by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const job = await prisma.pdfJob.findUnique({
      where: { id },
      include: {
        quote: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!job) {
      const error: AppError = new Error('PDF job not found');
      error.statusCode = 404;
      throw error;
    }

    res.json(job);
  })
);

/**
 * POST /api/pdf-jobs
 * Create a new PDF job and trigger async processing
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const validated = createPdfJobSchema.parse(req.body);

    // Verify quote exists
    const quote = await prisma.quote.findUnique({
      where: { id: validated.quoteId },
      include: {
        items: true,
      },
    });

    if (!quote) {
      const error: AppError = new Error('Quote not found');
      error.statusCode = 404;
      throw error;
    }

    // Create PDF job with pending status
    const pdfJob = await prisma.pdfJob.create({
      data: {
        quoteId: validated.quoteId,
        status: 'pending',
      },
    });

    // Trigger async PDF processing (fire and forget)
    processPdfJobAsync(pdfJob.id, quote).catch((error) => {
      console.error(`Failed to process PDF job ${pdfJob.id}:`, error);
      // Update job status to failed
      prisma.pdfJob
        .update({
          where: { id: pdfJob.id },
          data: {
            status: 'failed',
            errorMessage: error.message || 'Failed to process PDF',
          },
        })
        .catch(console.error);
    });

    // Return 202 Accepted with job ID
    res.status(202).json({
      jobId: pdfJob.id,
      status: pdfJob.status,
      quoteId: pdfJob.quoteId,
      createdAt: pdfJob.createdAt.toISOString(),
    });
  })
);

/**
 * GET /api/pdf-jobs/quote/:quoteId
 * Get PDF jobs for a specific quote
 */
router.get(
  '/quote/:quoteId',
  asyncHandler(async (req, res) => {
    const { quoteId } = req.params;

    const jobs = await prisma.pdfJob.findMany({
      where: { quoteId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ jobs });
  })
);

/**
 * Async function to process PDF job
 */
async function processPdfJobAsync(
  jobId: string,
  quote: {
    id: string;
    customerName: string;
    customerEmail: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    notes: string | null;
    validUntil: Date | null;
  }
) {
  try {
    // Update status to processing
    await prisma.pdfJob.update({
      where: { id: jobId },
      data: { status: 'processing' },
    });

    // Call PDF service to generate PDF
    const response = await axios.post(`${PDF_SERVICE_URL}/process`, {
      jobId,
      quoteId: quote.id,
      status: 'processing',
      createdAt: new Date(),
    });

    // Update job with PDF URL
    await prisma.pdfJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        pdfUrl: response.data.filePath || `/pdfs/${jobId}.pdf`,
        completedAt: new Date(),
      },
    });
  } catch (error: any) {
    // Update job with error
    await prisma.pdfJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        errorMessage: error.message || 'Failed to process PDF',
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export default router;
