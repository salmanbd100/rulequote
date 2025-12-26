import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Alert,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Link,
  Spinner,
  Table,
  Text,
  VStack,
  createToaster,
  Separator,
} from '@chakra-ui/react';
import { useGeneratePdf, usePdfJobStatus, useQuote } from '@rulequote/data-access';
import { AppButton } from '@rulequote/ui';
import { formatCurrency } from '@rulequote/utils';
import { useNavigate, useParams } from 'react-router-dom';

const toaster = createToaster({
  placement: 'top-end',
  duration: 3000,
});

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quote, isLoading, error } = useQuote(id || '');
  const generatePdf = useGeneratePdf();

  // Get the most recent PDF job for this quote
  const latestPdfJob = (quote as any)?.pdfJobs?.[0];
  const { data: pdfJobStatus } = usePdfJobStatus(latestPdfJob?.id || null, {
    enabled: !!latestPdfJob?.id,
  });

  const handleGeneratePdf = async () => {
    if (!id) {
      return;
    }

    try {
      await generatePdf.mutateAsync({ quoteId: id });
      toaster.create({
        title: 'PDF generation started',
        description: 'Your PDF is being generated. This may take a few moments.',
        type: 'info',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start PDF generation';
      toaster.error({
        title: 'Error generating PDF',
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading quote...</Text>
      </Box>
    );
  }

  if (error || !quote) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Title>Error loading quote</Alert.Title>
        <Alert.Description>{error?.message || 'Quote not found'}</Alert.Description>
      </Alert.Root>
    );
  }

  const currentPdfJob = pdfJobStatus || latestPdfJob;
  const pdfUrl = currentPdfJob?.pdfUrl ? `http://localhost:3334${currentPdfJob.pdfUrl}` : null;

  return (
    <VStack align="stretch" gap={6} maxW="4xl" mx="auto">
      <HStack>
        <Button variant="ghost" onClick={() => navigate('/quotes')}>
          <ArrowBackIcon /> Back to Quotes
        </Button>
      </HStack>

      <HStack justify="space-between">
        <VStack align="flex-start" gap={2}>
          <Heading size="xl">Quote #{quote.id}</Heading>
          <HStack>
            <Badge colorScheme={quote.customerType === 'premium' ? 'purple' : 'gray'}>
              {quote.customerType || 'standard'}
            </Badge>
            <Text color="gray.500" fontSize="sm">
              Created {new Date(quote.createdAt).toLocaleDateString()}
            </Text>
          </HStack>
        </VStack>
        <HStack>
          {pdfUrl && currentPdfJob?.status === 'completed' ? (
            <Link href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <AppButton>
                Download PDF <ExternalLinkIcon />
              </AppButton>
            </Link>
          ) : (
            <AppButton
              onClick={handleGeneratePdf}
              loading={generatePdf.isPending || currentPdfJob?.status === 'processing'}
              loadingText={currentPdfJob?.status === 'processing' ? 'Generating...' : 'Starting...'}
            >
              {currentPdfJob?.status === 'pending' ? 'Generating PDF...' : 'Generate PDF'}
            </AppButton>
          )}
        </HStack>
      </HStack>

      <Box bg="white" p={6} borderRadius="md" boxShadow="sm">
        <VStack align="stretch" gap={6}>
          <Box>
            <Heading size="sm" mb={3}>
              Customer Information
            </Heading>
            <VStack align="flex-start" gap={1}>
              <Text>
                <strong>Name:</strong> {quote.customerName}
              </Text>
              <Text>
                <strong>Email:</strong> {quote.customerEmail}
              </Text>
            </VStack>
          </Box>

          <Separator />

          <Box>
            <Heading size="sm" mb={3}>
              Line Items
            </Heading>
            <Table.Root variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Description</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Quantity</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Unit Price</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Total</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {quote.items?.map((item: any, index: number) => (
                  <Table.Row key={item.id || index}>
                    <Table.Cell>{item.description}</Table.Cell>
                    <Table.Cell textAlign="right">{item.quantity}</Table.Cell>
                    <Table.Cell textAlign="right">{formatCurrency(item.unitPrice)}</Table.Cell>
                    <Table.Cell textAlign="right" fontWeight="semibold">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <Separator />

          <Box>
            <Heading size="sm" mb={3}>
              Totals
            </Heading>
            <VStack align="stretch" gap={2} maxW="sm" ml="auto">
              <HStack justify="space-between">
                <Text>Subtotal:</Text>
                <Text fontWeight="semibold">{formatCurrency((quote as any).subtotal || 0)}</Text>
              </HStack>
              {(quote as any).discount > 0 && (
                <HStack justify="space-between">
                  <Text>Discount:</Text>
                  <Text fontWeight="semibold" color="green.600">
                    -{formatCurrency((quote as any).discount || 0)}
                  </Text>
                </HStack>
              )}
              <HStack justify="space-between">
                <Text>Tax:</Text>
                <Text fontWeight="semibold">{formatCurrency((quote as any).tax || 0)}</Text>
              </HStack>
              <Separator />
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">
                  Total:
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  {formatCurrency((quote as any).total || 0)}
                </Text>
              </HStack>
            </VStack>
          </Box>

          {quote.notes && (
            <>
              <Separator />
              <Box>
                <Heading size="sm" mb={2}>
                  Notes
                </Heading>
                <Text>{quote.notes}</Text>
              </Box>
            </>
          )}

          {currentPdfJob && (
            <>
              <Separator />
              <Box>
                <Heading size="sm" mb={3}>
                  PDF Status
                </Heading>
                <VStack align="flex-start" gap={2}>
                  <HStack>
                    <Badge
                      colorScheme={
                        currentPdfJob.status === 'completed'
                          ? 'green'
                          : currentPdfJob.status === 'failed'
                            ? 'red'
                            : currentPdfJob.status === 'processing'
                              ? 'blue'
                              : 'gray'
                      }
                    >
                      {currentPdfJob.status}
                    </Badge>
                    {currentPdfJob.status === 'processing' && <Spinner size="sm" />}
                  </HStack>
                  {currentPdfJob.errorMessage && (
                    <Alert.Root status="error" size="sm">
                      <Alert.Indicator />
                      <Alert.Description>{currentPdfJob.errorMessage}</Alert.Description>
                    </Alert.Root>
                  )}
                </VStack>
              </Box>
            </>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}
