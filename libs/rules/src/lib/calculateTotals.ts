import { rulesConfig } from './rules.config';

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CalculateTotalsInput {
  items: QuoteItem[];
  customerType?: 'standard' | 'premium';
}

export interface Totals {
  subtotal: number;
  discount: number;
  discountPercentage: number;
  tax: number;
  total: number;
  breakdown: {
    explanation: string[];
  };
}

/**
 * Calculate totals for quote items with rules-based discounts and taxes
 */
export function calculateTotals(input: CalculateTotalsInput): Totals {
  const { items, customerType = 'standard' } = input;
  const explanation: string[] = [];

  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  explanation.push(`Subtotal: $${subtotal.toFixed(2)} (${items.length} items)`);

  // Calculate discount based on customer type and subtotal
  let discount = 0;
  let discountPercentage = 0;

  if (rulesConfig.discountRules.enabled) {
    const discountRule = rulesConfig.discountRules[customerType];
    if (subtotal >= discountRule.threshold) {
      discountPercentage = discountRule.percentage;
      discount = subtotal * discountRule.percentage;
      explanation.push(
        `${customerType === 'premium' ? 'Premium' : 'Standard'} customer discount: ${(discountPercentage * 100).toFixed(0)}% (applied for orders over $${discountRule.threshold})`
      );
    } else {
      explanation.push(
        `No discount applied (minimum $${discountRule.threshold} required for ${customerType} customers)`
      );
    }
  }

  const subtotalAfterDiscount = subtotal - discount;

  // Calculate tax based on customer type
  const taxRate = rulesConfig.taxRates[customerType];
  const tax = subtotalAfterDiscount * taxRate;
  explanation.push(
    `Tax (${(taxRate * 100).toFixed(0)}% for ${customerType} customers): $${tax.toFixed(2)}`
  );

  // Calculate total
  const total = subtotalAfterDiscount + tax;
  explanation.push(`Total: $${total.toFixed(2)}`);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    discountPercentage: discountPercentage,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    breakdown: {
      explanation,
    },
  };
}
