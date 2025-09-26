import React from 'react';

import { Button, ButtonProps } from './button';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(({ loading = false, loadingText, children, disabled, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      disabled={disabled || loading}
      loading={loading}
      loadingText={loadingText}
      {...props}
    >
      {children}
    </Button>
  );
});

LoadingButton.displayName = 'LoadingButton';
