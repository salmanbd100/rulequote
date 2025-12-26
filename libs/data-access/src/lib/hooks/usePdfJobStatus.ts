import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../apiClient';
import { queryKeys } from '../queryKeys';

export interface PdfJobStatus {
  id: string;
  quoteId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pdfUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Hook to fetch PDF job status with polling
 */
export function usePdfJobStatus(jobId: string | null, options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery<PdfJobStatus>({
    queryKey: queryKeys.pdfJobs.detail(jobId || ''),
    queryFn: async () => {
      const response = await apiClient.get(`/pdf-jobs/${jobId}`);
      return response.data;
    },
    enabled: !!jobId && (options?.enabled !== false),
    refetchInterval: (data) => {
      // Poll every 2 seconds if job is pending or processing
      if (data?.status === 'pending' || data?.status === 'processing') {
        return options?.refetchInterval || 2000;
      }
      // Stop polling if completed or failed
      return false;
    },
  });
}

