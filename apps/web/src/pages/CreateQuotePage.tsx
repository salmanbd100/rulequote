import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createQuoteSchema, CreateQuoteInput } from '@rulequote/schemas';
import { useCreateQuote } from '@rulequote/data-access';

export function CreateQuotePage() {
  const navigate = useNavigate();
  const createQuote = useCreateQuote();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateQuoteInput>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = async (data: CreateQuoteInput) => {
    try {
      await createQuote.mutateAsync(data);
      navigate('/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
    }
  };

  return (
    <div>
      <h1>Create Quote</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>
            Customer Name:
            <input {...register('customerName')} />
            {errors.customerName && (
              <span>{errors.customerName.message}</span>
            )}
          </label>
        </div>

        <div>
          <label>
            Customer Email:
            <input type="email" {...register('customerEmail')} />
            {errors.customerEmail && (
              <span>{errors.customerEmail.message}</span>
            )}
          </label>
        </div>

        <div>
          <h3>Items</h3>
          {fields.map((field, index) => (
            <div key={field.id}>
              <input
                {...register(`items.${index}.description`)}
                placeholder="Description"
              />
              <input
                type="number"
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                placeholder="Quantity"
              />
              <input
                type="number"
                step="0.01"
                {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                placeholder="Unit Price"
              />
              <button type="button" onClick={() => remove(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
            Add Item
          </button>
          {errors.items && <span>{errors.items.message}</span>}
        </div>

        <div>
          <label>
            Notes:
            <textarea {...register('notes')} />
          </label>
        </div>

        <button type="submit" disabled={createQuote.isPending}>
          {createQuote.isPending ? 'Creating...' : 'Create Quote'}
        </button>
      </form>
    </div>
  );
}
