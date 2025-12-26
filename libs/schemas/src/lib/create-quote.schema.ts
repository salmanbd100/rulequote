import { z } from 'zod';

/**
 * Schema for creating a quote
 */
export const createQuoteSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerType: z.enum(['standard', 'premium']).optional().default('standard'),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Item description is required'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
        unitPrice: z.number().nonnegative('Unit price must be non-negative'),
      })
    )
    .min(1, 'At least one item is required'),
  notes: z.string().optional(),
  validUntil: z.date().optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
