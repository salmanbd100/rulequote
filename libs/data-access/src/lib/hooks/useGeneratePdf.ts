import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../apiClient';
import { queryKeys } from '../queryKeys';

export interface GeneratePdfInput {
  quoteId: string;
}

export interface GeneratePdfResponse {
  jobId: string;
  status: string;
  quoteId: string;
  createdAt: string;
}

/**
 * Hook to generate a PDF for a quote
 */
export function useGeneratePdf() {
  const queryClient = useQueryClient();

  return useMutation<GeneratePdfResponse, Error, GeneratePdfInput>({
    mutationFn: async ({ quoteId }) => {
      const response = await apiClient.post('/pdf-jobs', { quoteId });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate PDF jobs list for this quote
      queryClient.invalidateQueries({
        queryKey: queryKeys.pdfJobs.list(variables.quoteId),
      });
      // Invalidate the specific job detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.pdfJobs.detail(data.jobId),
      });
    },
  });
}
