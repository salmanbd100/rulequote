/**
 * Query keys for React Query
 */
export const queryKeys = {
  quotes: {
    all: ['quotes'] as const,
    lists: () => [...queryKeys.quotes.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.quotes.lists(), { filters }] as const,
    details: () => [...queryKeys.quotes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.quotes.details(), id] as const,
  },
  pdfJobs: {
    all: ['pdf-jobs'] as const,
    lists: () => [...queryKeys.pdfJobs.all, 'list'] as const,
    list: (quoteId: string) => [...queryKeys.pdfJobs.lists(), quoteId] as const,
    details: () => [...queryKeys.pdfJobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.pdfJobs.details(), id] as const,
  },
};


