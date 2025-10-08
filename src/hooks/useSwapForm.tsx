import { useForm } from 'react-hook-form';

export type SwapFormData = {
  payAmount: string;
};

export function useSwapForm() {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SwapFormData>({
    defaultValues: { payAmount: '' },
  });

  const payAmount = watch('payAmount');

  return { control, handleSubmit, watch, reset, errors, payAmount };
}
