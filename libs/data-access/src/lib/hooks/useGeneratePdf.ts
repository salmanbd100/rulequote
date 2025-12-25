import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../apiClient';
import { queryKeys } from '../queryKeys';

interface GeneratePdfInput {
  quoteId: string;
}

interface GeneratePdfResponse {
  jobId: string;
  status: string;
}

/**
 * Hook to generate a PDF for a quote
 */
export function useGeneratePdf() {
  return useMutation<GeneratePdfResponse, Error, GeneratePdfInput>({
    mutationFn: async ({ quoteId }) => {
      const response = await apiClient.post('/pdf-jobs', { quoteId });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate PDF jobs list for this quote
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.pdfJobs.list(variables.quoteId),
      // });
    },
  });
}
