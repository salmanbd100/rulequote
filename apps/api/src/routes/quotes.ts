import { calculateTotals } from '@rulequote/rules';
import { createQuoteSchema } from '@rulequote/schemas';
import { Router } from 'express';

import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/error-handler';

const router = Router();

/**
 * GET /api/quotes
 * Get all quotes
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const quotes = await prisma.quote.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ quotes });
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

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        pdfJobs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get the most recent PDF job
        },
      },
    });

    if (!quote) {
      const error: AppError = new Error('Quote not found');
      error.statusCode = 404;
      throw error;
    }

    res.json(quote);
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
    const customerType = (req.body.customerType as 'standard' | 'premium') || 'standard';

    // Calculate totals using rules engine
    const totals = calculateTotals({
      items: validated.items,
      customerType,
    });

    // Create quote with items in a transaction
    const quote = await prisma.quote.create({
      data: {
        customerName: validated.customerName,
        customerEmail: validated.customerEmail,
        customerType,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        notes: validated.notes || null,
        validUntil: validated.validUntil || null,
        items: {
          create: validated.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(quote);
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

    const existingQuote = await prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingQuote) {
      const error: AppError = new Error('Quote not found');
      error.statusCode = 404;
      throw error;
    }

    // If items are being updated, recalculate totals
    let totals;
    if (validated.items) {
      const customerType =
        (req.body.customerType as 'standard' | 'premium') || existingQuote.customerType;
      totals = calculateTotals({
        items: validated.items,
        customerType: customerType as 'standard' | 'premium',
      });
    }

    // Update quote
    const quote = await prisma.quote.update({
      where: { id },
      data: {
        customerName: validated.customerName,
        customerEmail: validated.customerEmail,
        customerType: req.body.customerType || existingQuote.customerType,
        notes: validated.notes,
        validUntil: validated.validUntil,
        ...(totals && {
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          total: totals.total,
        }),
        ...(validated.items && {
          items: {
            deleteMany: {},
            create: validated.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        }),
      },
      include: {
        items: true,
      },
    });

    res.json(quote);
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

    const quote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!quote) {
      const error: AppError = new Error('Quote not found');
      error.statusCode = 404;
      throw error;
    }

    // Cascade delete will handle items and pdfJobs
    await prisma.quote.delete({
      where: { id },
    });

    res.status(204).send();
  })
);

export default router;
