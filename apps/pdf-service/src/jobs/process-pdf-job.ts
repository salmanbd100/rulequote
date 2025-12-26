import { PdfJob } from '@rulequote/schemas';
import { generateQuoteHtml } from '../templates/quote-html';
import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3333/api';
const PDF_OUTPUT_DIR = process.env.PDF_OUTPUT_DIR || path.join(process.cwd(), 'tmp', 'pdfs');

/**
 * Process a PDF job - generates PDF from quote data
 */
export async function processPdfJob(job: PdfJob): Promise<string> {
  console.log(`Processing PDF job: ${job.jobId} for quote: ${job.quoteId}`);

  try {
    // 1. Fetch quote data from API
    const quoteResponse = await axios.get(`${API_URL}/quotes/${job.quoteId}`);
    const quote = quoteResponse.data;

    // 2. Generate HTML from template
    const html = generateQuoteHtml({
      id: quote.id,
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      customerType: quote.customerType || 'standard',
      items: quote.items || [],
      notes: quote.notes || null,
      validUntil: quote.validUntil || null,
      subtotal: quote.subtotal,
      discount: quote.discount,
      tax: quote.tax,
      total: quote.total,
      createdAt: quote.createdAt,
    });

    // 3. Ensure output directory exists
    await fs.mkdir(PDF_OUTPUT_DIR, { recursive: true });

    // 4. For demo purposes, save HTML file (in production, use puppeteer/playwright to convert to PDF)
    // In a real implementation, you would use:
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setContent(html);
    // const pdfBuffer = await page.pdf({ format: 'A4' });
    // await fs.writeFile(pdfPath, pdfBuffer);
    // await browser.close();

    const pdfPath = path.join(PDF_OUTPUT_DIR, `${job.jobId}.html`);
    await fs.writeFile(pdfPath, html, 'utf-8');

    // For demo: also create a simple text representation
    const pdfTextPath = path.join(PDF_OUTPUT_DIR, `${job.jobId}.txt`);
    const textContent = `
Quote #${quote.id}
Date: ${new Date(quote.createdAt).toLocaleDateString()}

Customer: ${quote.customerName}
Email: ${quote.customerEmail}

Items:
${(quote.items || []).map((item: any) =>
  `  - ${item.description}: ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${(item.quantity * item.unitPrice).toFixed(2)}`
).join('\n')}

Subtotal: $${quote.subtotal.toFixed(2)}
${quote.discount > 0 ? `Discount: -$${quote.discount.toFixed(2)}\n` : ''}Tax: $${quote.tax.toFixed(2)}
Total: $${quote.total.toFixed(2)}
    `.trim();
    await fs.writeFile(pdfTextPath, textContent, 'utf-8');

    // Return the file path (relative to public directory for serving)
    const relativePath = `/pdfs/${job.jobId}.html`;
    console.log(`PDF generated successfully: ${relativePath}`);

    return relativePath;
  } catch (error: any) {
    console.error(`Error processing PDF job ${job.jobId}:`, error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
}
