import { CreateQuoteInput } from '@rulequote/schemas';
import { calculateTotals } from '@rulequote/rules';

export interface QuoteForPdf extends CreateQuoteInput {
  id: string;
  customerType?: 'standard' | 'premium';
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  createdAt?: Date | string;
}

/**
 * Generate HTML template for a quote
 */
export function generateQuoteHtml(quote: QuoteForPdf): string {
  const items = quote.items || [];

  // Use provided totals or calculate them
  let totals;
  if (quote.subtotal !== undefined && quote.tax !== undefined && quote.total !== undefined) {
    totals = {
      subtotal: quote.subtotal,
      discount: quote.discount || 0,
      tax: quote.tax,
      total: quote.total,
    };
  } else {
    const calculated = calculateTotals({
      items,
      customerType: quote.customerType || 'standard',
    });
    totals = {
      subtotal: calculated.subtotal,
      discount: calculated.discount,
      tax: calculated.tax,
      total: calculated.total,
    };
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote #${quote.id}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .customer-info {
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f4f4f4;
    }
    .totals {
      text-align: right;
      margin-top: 20px;
    }
    .total-row {
      font-weight: bold;
      font-size: 1.2em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Quote #${quote.id}</h1>
    <p>Date: ${quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
    ${quote.customerType === 'premium' ? '<p><strong>Premium Customer</strong></p>' : ''}
  </div>

  <div class="customer-info">
    <h2>Customer Information</h2>
    <p><strong>Name:</strong> ${quote.customerName}</p>
    <p><strong>Email:</strong> ${quote.customerEmail}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (item) => `
      <tr>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>$${item.unitPrice.toFixed(2)}</td>
        <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
      </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    <p>Subtotal: $${totals.subtotal.toFixed(2)}</p>
    ${totals.discount > 0 ? `<p>Discount: -$${totals.discount.toFixed(2)}</p>` : ''}
    <p>Tax: $${totals.tax.toFixed(2)}</p>
    <p class="total-row">Total: $${totals.total.toFixed(2)}</p>
  </div>

  ${quote.notes ? `<div><h3>Notes</h3><p>${quote.notes}</p></div>` : ''}

  ${quote.validUntil ? `<p><em>Valid until: ${new Date(quote.validUntil).toLocaleDateString()}</em></p>` : ''}
</body>
</html>
  `.trim();
}
