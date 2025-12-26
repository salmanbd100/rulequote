import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  createToaster,
  Heading,
  HStack,
  IconButton,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Alert } from '@chakra-ui/react/alert';
import { NativeSelectField, NativeSelectRoot } from '@chakra-ui/react/native-select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateQuote } from '@rulequote/data-access';
import { calculateTotals } from '@rulequote/rules';
import { CreateQuoteInput, createQuoteSchema } from '@rulequote/schemas';
import { AppButton, FormField } from '@rulequote/ui';
import { formatCurrency } from '@rulequote/utils';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const toaster = createToaster({
  placement: 'top-end',
  duration: 3000,
});

export function CreateQuotePage() {
  const navigate = useNavigate();
  const createQuote = useCreateQuote();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      customerType: 'standard' as const,
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch form values to calculate totals in real-time
  const watchedItems = useWatch({ control, name: 'items' });
  const watchedCustomerType = useWatch({ control, name: 'customerType' });

  const totals = calculateTotals({
    items: watchedItems || [],
    customerType: watchedCustomerType || 'standard',
  });

  const onSubmit = async (data: CreateQuoteInput) => {
    try {
      const result = await createQuote.mutateAsync(data);
      toaster.success({
        title: 'Quote created',
        description: 'Your quote has been created successfully.',
      });
      navigate(`/quotes/${result.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create quote';
      toaster.error({
        title: 'Error creating quote',
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <VStack align="stretch" gap={6} maxW="4xl" mx="auto">
      <Heading size="xl">Create New Quote</Heading>

      <Box
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="sm"
      >
        <VStack align="stretch" gap={6}>
          <HStack gap={4}>
            <FormField
              label="Customer Name"
              error={errors.customerName?.message}
              isRequired
              flex={1}
              inputProps={{
                ...register('customerName'),
                placeholder: 'Enter customer name',
              }}
            />
            <FormField
              label="Customer Email"
              type="email"
              error={errors.customerEmail?.message}
              isRequired
              flex={1}
              inputProps={{
                ...register('customerEmail'),
                placeholder: 'customer@example.com',
              }}
            />
          </HStack>

          <Box>
            <Text as="label" fontSize="sm" fontWeight="medium" mb={2} display="block">
              Customer Type
            </Text>
            <NativeSelectRoot>
              <NativeSelectField {...register('customerType')}>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </NativeSelectField>
            </NativeSelectRoot>
          </Box>

          <Separator />

          <Box>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Line Items</Heading>
              <Button
                size="sm"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
              >
                <AddIcon /> Add Item
              </Button>
            </HStack>

            <VStack align="stretch" gap={4}>
              {fields.map((field, index) => (
                <Box key={field.id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <HStack gap={4} align="flex-start">
                    <FormField
                      label="Description"
                      error={errors.items?.[index]?.description?.message}
                      isRequired
                      flex={2}
                      inputProps={{
                        ...register(`items.${index}.description`),
                        placeholder: 'Item description',
                      }}
                    />
                    <FormField
                      label="Quantity"
                      type="number"
                      error={errors.items?.[index]?.quantity?.message}
                      isRequired
                      flex={1}
                      inputProps={{
                        ...register(`items.${index}.quantity`, { valueAsNumber: true, min: 1 }),
                        placeholder: '1',
                      }}
                    />
                    <FormField
                      label="Unit Price"
                      type="number"
                      error={errors.items?.[index]?.unitPrice?.message}
                      isRequired
                      flex={1}
                      inputProps={{
                        ...register(`items.${index}.unitPrice`, {
                          valueAsNumber: true,
                          min: 0,
                        }),
                        placeholder: '0.00',
                      }}
                    />
                    <IconButton
                      aria-label="Remove item"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => remove(index)}
                      mt={8}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </HStack>
                </Box>
              ))}
            </VStack>
            {errors.items && (
              <Alert.Root status="error" mt={2}>
                <Alert.Indicator />
                <Alert.Description>{errors.items.message}</Alert.Description>
              </Alert.Root>
            )}
          </Box>

          <FormField
            label="Notes"
            type="textarea"
            inputProps={{
              ...register('notes'),
              placeholder: 'Additional notes (optional)',
              rows: 3,
            }}
          />

          <Separator />

          {/* Totals Preview */}
          <Box bg="gray.50" p={4} borderRadius="md">
            <Heading size="sm" mb={3}>
              Totals Preview
            </Heading>
            <VStack align="stretch" gap={2}>
              <HStack justify="space-between">
                <Text>Subtotal:</Text>
                <Text fontWeight="semibold">{formatCurrency(totals.subtotal)}</Text>
              </HStack>
              {totals.discount > 0 && (
                <HStack justify="space-between">
                  <Text>Discount ({totals.discountPercentage * 100}%):</Text>
                  <Text fontWeight="semibold" color="green.600">
                    -{formatCurrency(totals.discount)}
                  </Text>
                </HStack>
              )}
              <HStack justify="space-between">
                <Text>Tax:</Text>
                <Text fontWeight="semibold">{formatCurrency(totals.tax)}</Text>
              </HStack>
              <Separator />
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">
                  Total:
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  {formatCurrency(totals.total)}
                </Text>
              </HStack>
            </VStack>
          </Box>

          <HStack justify="flex-end" gap={4}>
            <Button variant="ghost" onClick={() => navigate('/quotes')}>
              Cancel
            </Button>
            <AppButton type="submit" loading={createQuote.isPending}>
              Create Quote
            </AppButton>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
}
