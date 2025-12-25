import { rulesConfig } from './rules.config';

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Totals {
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Calculate totals for quote items
 */
export function calculateTotals(items: QuoteItem[]): Totals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const tax = subtotal * rulesConfig.taxRate;
  const total = subtotal + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
