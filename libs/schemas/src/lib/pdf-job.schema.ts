import { z } from 'zod';

/**
 * Schema for PDF job processing
 */
export const pdfJobSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  quoteId: z.string().min(1, 'Quote ID is required'),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  filePath: z.string().optional(),
  error: z.string().optional(),
  createdAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type PdfJob = z.infer<typeof pdfJobSchema>;

/**
 * Schema for creating a PDF job
 */
export const createPdfJobSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required'),
});

export type CreatePdfJobInput = z.infer<typeof createPdfJobSchema>;


