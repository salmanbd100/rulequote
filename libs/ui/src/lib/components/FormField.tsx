import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  FormControlProps,
  InputProps,
  TextareaProps,
} from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface FormFieldProps extends Omit<FormControlProps, 'children'> {
  label: string;
  error?: string;
  isRequired?: boolean;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea';
  inputProps?: InputProps | TextareaProps;
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({ label, error, isRequired, type = 'text', inputProps, ...formControlProps }, ref) => {
    const InputComponent = type === 'textarea' ? Textarea : Input;

    return (
      <FormControl isInvalid={!!error} isRequired={isRequired} {...formControlProps}>
        <FormLabel>{label}</FormLabel>
        <InputComponent
          ref={ref as any}
          type={type === 'textarea' ? undefined : type}
          {...(inputProps as any)}
        />
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    );
  }
);

FormField.displayName = 'FormField';

