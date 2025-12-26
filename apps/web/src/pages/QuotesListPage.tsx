import {
  Alert,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Quote, useDeleteQuote, useQuotes } from '@rulequote/data-access';
import { AppButton, ConfirmModal } from '@rulequote/ui';
import { formatCurrency } from '@rulequote/utils';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function QuotesListPage() {
  const navigate = useNavigate();
  const { data: quotes, isLoading, error } = useQuotes();
  const deleteQuote = useDeleteQuote();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; quote: Quote | null }>({
    isOpen: false,
    quote: null,
  });

  const handleDeleteClick = (quote: Quote) => {
    setDeleteConfirm({ isOpen: true, quote });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.quote) {
      await deleteQuote.mutateAsync(deleteConfirm.quote.id);
      setDeleteConfirm({ isOpen: false, quote: null });
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading quotes...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Title>Error loading quotes</Alert.Title>
        <Alert.Description>{error.message}</Alert.Description>
      </Alert.Root>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <HStack justify="space-between">
        <Heading size="xl">Quotes</Heading>
        <AppButton onClick={() => navigate('/quotes/new')}>Create New Quote</AppButton>
      </HStack>

      {quotes && quotes.length > 0 ? (
        <Box bg="white" borderRadius="md" boxShadow="sm" overflow="hidden">
          <Table.Root variant="outline">
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader>Customer</Table.ColumnHeader>
                <Table.ColumnHeader>Email</Table.ColumnHeader>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Total</Table.ColumnHeader>
                <Table.ColumnHeader>Created</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {quotes.map((quote) => (
                <Table.Row key={quote.id} _hover={{ bg: 'gray.50' }}>
                  <Table.Cell>
                    <Link
                      to={`/quotes/${quote.id}`}
                      style={{ textDecoration: 'none', fontWeight: 'medium' }}
                    >
                      {quote.customerName}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{quote.customerEmail}</Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme={quote.customerType === 'premium' ? 'purple' : 'gray'}>
                      {quote.customerType || 'standard'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="right" fontWeight="semibold">
                    {formatCurrency((quote as any).total || 0)}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date((quote as any).createdAt || quote.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/quotes/${quote.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(quote)}
                        loading={deleteQuote.isPending}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      ) : (
        <Box bg="white" p={8} borderRadius="md" textAlign="center">
          <Text color="gray.500" fontSize="lg">
            No quotes found. Create your first quote to get started!
          </Text>
          <AppButton mt={4} onClick={() => navigate('/quotes/new')}>
            Create Quote
          </AppButton>
        </Box>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, quote: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Quote"
        message={`Are you sure you want to delete the quote for ${deleteConfirm.quote?.customerName}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleteQuote.isPending}
      />
    </VStack>
  );
}
