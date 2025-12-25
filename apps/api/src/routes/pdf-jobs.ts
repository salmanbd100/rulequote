import { Router } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { createPdfJobSchema } from '@rulequote/schemas';

const router = Router();

/**
 * GET /api/pdf-jobs
 * Get all PDF jobs
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    // TODO: Implement database query
    res.json({ jobs: [] });
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
    // TODO: Implement database query
    res.status(404).json({ error: 'PDF job not found' });
  })
);

/**
 * POST /api/pdf-jobs
 * Create a new PDF job
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const validated = createPdfJobSchema.parse(req.body);
    // TODO: Create job and trigger PDF generation
    res.status(201).json({
      jobId: `job-${Date.now()}`,
      quoteId: validated.quoteId,
      status: 'pending',
      createdAt: new Date().toISOString(),
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
    // TODO: Implement database query
    res.json({ jobs: [] });
  })
);

export default router;
