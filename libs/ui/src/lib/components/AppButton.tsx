import { Button, ButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface AppButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ variant = 'primary', ...props }, ref) => {
    const variantProps: ButtonProps = {
      primary: {
        colorScheme: 'blue',
      },
      secondary: {
        colorScheme: 'gray',
        variant: 'outline',
      },
      danger: {
        colorScheme: 'red',
      },
      ghost: {
        variant: 'ghost',
      },
    }[variant];

    return <Button ref={ref} {...variantProps} {...props} />;
  }
);

AppButton.displayName = 'AppButton';

