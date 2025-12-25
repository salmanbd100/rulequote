import { Router } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { createQuoteSchema } from '@rulequote/schemas';

const router = Router();

/**
 * GET /api/quotes
 * Get all quotes
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    // TODO: Implement database query
    res.json({ quotes: [] });
  })
);

/**
 * GET /api/quotes/:id
 * Get a single quote by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    // TODO: Implement database query
    res.status(404).json({ error: 'Quote not found' });
  })
);

/**
 * POST /api/quotes
 * Create a new quote
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const validated = createQuoteSchema.parse(req.body);
    // TODO: Save to database
    res.status(201).json({
      id: 'temp-id',
      ...validated,
      createdAt: new Date().toISOString(),
    });
  })
);

/**
 * PUT /api/quotes/:id
 * Update an existing quote
 */
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validated = createQuoteSchema.partial().parse(req.body);
    // TODO: Update in database
    res.json({ id, ...validated });
  })
);

/**
 * DELETE /api/quotes/:id
 * Delete a quote
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    // TODO: Delete from database
    res.status(204).send();
  })
);

export default router;
