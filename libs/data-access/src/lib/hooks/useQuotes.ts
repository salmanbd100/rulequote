import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../apiClient';
import { queryKeys } from '../queryKeys';
import { CreateQuoteInput } from '@rulequote/schemas';

export interface Quote extends CreateQuoteInput {
  id: string;
  createdAt: string;
}

/**
 * Hook to fetch all quotes
 */
export function useQuotes() {
  return useQuery<Quote[]>({
    queryKey: queryKeys.quotes.lists(),
    queryFn: async () => {
      const response = await apiClient.get('/quotes');
      return response.data.quotes || [];
    },
  });
}

/**
 * Hook to fetch a single quote by ID
 */
export function useQuote(id: string) {
  return useQuery<Quote>({
    queryKey: queryKeys.quotes.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/quotes/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new quote
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuoteInput) => {
      const response = await apiClient.post('/quotes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists() });
    },
  });
}
