# RuleQuote

A rules-based quote builder with async PDF export, built as an Nx monorepo.

## 🎯 Project Overview

RuleQuote is a full-stack application that demonstrates:
- **Nx Monorepo** architecture with apps and libraries
- **React** with Chakra UI for modern, responsive UI
- **React Query** for efficient data fetching and caching
- **Zod + React Hook Form** for type-safe form validation
- **Node/Express** services with Prisma ORM
- **Rules engine** for config-driven business logic
- **Async job pattern** for PDF generation with real-time status tracking

## 📋 Features

- ✅ Create quotes with customer information and line items
- ✅ Rules-based totals calculation (discounts, taxes by customer type)
- ✅ Save quotes to PostgreSQL database
- ✅ Generate PDFs asynchronously with job status tracking
- ✅ View and download generated PDFs
- ✅ Delete quotes with confirmation
- ✅ Real-time PDF job status polling

## 🏗️ Architecture

### Monorepo Structure

```
rulequote/
├── apps/
│   ├── web/              # React frontend (Chakra UI + React Query)
│   ├── api/              # Express API (CRUD + rules evaluation)
│   └── pdf-service/      # Express worker (HTML→PDF generation)
├── libs/
│   ├── ui/               # Reusable Chakra UI components
│   ├── schemas/          # Zod schemas (shared FE/BE)
│   ├── data-access/      # API client + React Query hooks
│   ├── rules/            # Rules engine (calculateTotals)
│   └── utils/            # Utility functions
└── prisma/               # Prisma schema and migrations
```

### Technology Stack

**Frontend:**
- React 19 + TypeScript
- Chakra UI v3 for components
- React Query (TanStack Query) for data fetching
- React Hook Form + Zod for forms
- React Router for navigation

**Backend:**
- Node.js + Express
- Prisma ORM with PostgreSQL
- Zod for validation
- Axios for HTTP requests

**Infrastructure:**
- Nx monorepo
- pnpm workspaces
- TypeScript path aliases

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL

# Set up database
pnpm prisma generate
pnpm prisma migrate dev

# Start all services
pnpm dev
```

This starts:
- **Web app**: http://localhost:4200
- **API server**: http://localhost:3333/api
- **PDF service**: http://localhost:3334/api

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rulequote"
PORT=3333
PDF_SERVICE_URL=http://localhost:3334/api
API_URL=http://localhost:3333/api
```

For the web app, create `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3333/api
```

## 📁 Folder Structure

### Apps

#### `apps/web` - React Frontend
- **Pages**: QuotesListPage, CreateQuotePage, QuoteDetailPage
- **Components**: App layout with Chakra UI
- **Routing**: React Router with nested routes

#### `apps/api` - Express API
- **Routes**: `/api/quotes`, `/api/pdf-jobs`
- **Middleware**: Logger, error handler
- **Database**: Prisma client integration

#### `apps/pdf-service` - PDF Worker
- **Jobs**: `process-pdf-job.ts` - HTML to PDF conversion
- **Templates**: `quote-html.ts` - HTML template generator

### Libraries

#### `libs/ui` - UI Components
- `AppButton` - Styled button with variants
- `FormField` - Form input with label and error handling
- `ConfirmModal` - Confirmation dialog

#### `libs/schemas` - Zod Schemas
- `createQuoteSchema` - Quote creation validation
- `pdfJobSchema` - PDF job status schema

#### `libs/data-access` - API Integration
- `apiClient` - Axios instance with interceptors
- `useQuotes` - Fetch all quotes
- `useQuote` - Fetch single quote
- `useCreateQuote` - Create quote mutation
- `useDeleteQuote` - Delete quote mutation
- `useGeneratePdf` - Start PDF generation
- `usePdfJobStatus` - Poll PDF job status

#### `libs/rules` - Rules Engine
- `rules.config.ts` - Configurable rules (tax rates, discounts)
- `calculateTotals()` - Calculate subtotal, discount, tax, total

#### `libs/utils` - Utilities
- `formatCurrency()` - Format numbers as currency
- `parseError()` - Safe error message extraction

## 🔌 API Routes

### Quotes

```
GET    /api/quotes              # List all quotes
GET    /api/quotes/:id          # Get quote by ID
POST   /api/quotes              # Create new quote
PUT    /api/quotes/:id          # Update quote
DELETE /api/quotes/:id          # Delete quote
```

### PDF Jobs

```
GET    /api/pdf-jobs            # List all PDF jobs
GET    /api/pdf-jobs/:id        # Get PDF job status
POST   /api/pdf-jobs             # Create PDF job (returns 202 Accepted)
GET    /api/pdf-jobs/quote/:id  # Get PDF jobs for a quote
```

## 💾 Database Schema

### Quote
- `id` (cuid)
- `customerName`, `customerEmail`
- `customerType` (standard/premium)
- `subtotal`, `discount`, `tax`, `total`
- `notes`, `validUntil`
- `createdAt`, `updatedAt`

### QuoteItem
- `id`, `quoteId` (FK)
- `description`, `quantity`, `unitPrice`

### PdfJob
- `id`, `quoteId` (FK)
- `status` (pending/processing/completed/failed)
- `pdfUrl`, `errorMessage`
- `createdAt`, `completedAt`

## 🎨 UI Components

### Chakra UI Setup
- Provider configured in `main.tsx`
- Responsive design with breakpoints
- Consistent spacing and typography
- Toast notifications for user feedback

### Pages

**QuotesListPage:**
- Table view of all quotes
- Create new quote button
- Delete with confirmation modal
- Customer type badges

**CreateQuotePage:**
- Dynamic line items (add/remove)
- Real-time totals preview
- Customer type selection
- Form validation with error messages

**QuoteDetailPage:**
- Full quote details
- Line items table
- Totals breakdown
- PDF generation button
- PDF status with polling
- Download link when ready

## 🔄 Data Flow

### Creating a Quote
1. User fills form → React Hook Form validation
2. Submit → `useCreateQuote()` mutation
3. API validates with Zod → Prisma saves to DB
4. Rules engine calculates totals
5. React Query invalidates cache → UI updates

### Generating PDF
1. User clicks "Generate PDF" → `useGeneratePdf()` mutation
2. API creates `PdfJob` with status "pending"
3. Returns 202 Accepted with `jobId`
4. Frontend starts polling with `usePdfJobStatus()`
5. PDF service processes job asynchronously
6. Status updates: pending → processing → completed
7. UI shows download link when ready

## 🧪 Rules Engine

### Configuration (`libs/rules/rules.config.ts`)

```typescript
{
  taxRates: {
    standard: 0.1,  // 10%
    premium: 0.08,  // 8%
  },
  discountRules: {
    premium: {
      threshold: 100,    // $100
      percentage: 0.1,   // 10% discount
    },
    standard: {
      threshold: 500,    // $500
      percentage: 0.05,  // 5% discount
    },
  },
}
```

### Calculation Flow
1. Calculate subtotal from line items
2. Apply discount if threshold met (based on customer type)
3. Calculate tax on discounted amount
4. Calculate total
5. Return breakdown with explanation

## 🛠️ Development

### Run Individual Services

```bash
# Web app only
npx nx serve web

# API only
npx nx serve api

# PDF service only
npx nx serve pdf-service
```

### Database Commands

```bash
# Generate Prisma Client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name migration_name

# Reset database (dev only)
pnpm prisma migrate reset
```

### Code Quality

```bash
# Lint all projects
pnpm lint

# Format code
pnpm format

# Type check
npx nx run-many -t typecheck --all
```

## 📝 Key Implementation Details

### React Query Best Practices
- Stable query keys: `['quotes']`, `['quotes', id]`, `['pdfJobs', jobId]`
- Cache invalidation on mutations
- Polling for PDF job status (stops when completed)
- Optimistic updates (optional enhancement)

### Error Handling
- Centralized error handler middleware
- Consistent error response format
- Toast notifications for user feedback
- Safe error parsing utilities

### Type Safety
- Zod schemas shared across FE/BE
- TypeScript strict mode
- Prisma-generated types
- React Hook Form type inference

## 🎯 Demo Flow

1. **Create Quote**
   - Navigate to "Create New Quote"
   - Fill customer info, select type (standard/premium)
   - Add line items dynamically
   - See real-time totals preview
   - Submit → navigates to detail page

2. **View Quote**
   - See all quotes in table
   - Click to view details
   - See calculated totals with breakdown

3. **Generate PDF**
   - Click "Generate PDF" button
   - Status shows: pending → processing → completed
   - Download link appears when ready

4. **Delete Quote**
   - Click delete → confirmation modal
   - Confirm → quote removed, list updates

## 📚 Additional Resources

- [Nx Documentation](https://nx.dev)
- [Chakra UI](https://chakra-ui.com)
- [React Query](https://tanstack.com/query)
- [Prisma](https://www.prisma.io/docs)
- [Zod](https://zod.dev)

## 🚧 Future Enhancements

- [ ] Add authentication/authorization
- [ ] Email quote to customer
- [ ] Quote templates
- [ ] Export to CSV/Excel
- [ ] Advanced filtering and search
- [ ] Quote versioning
- [ ] Real-time collaboration
- [ ] PDF customization options

## 📄 License

MIT
