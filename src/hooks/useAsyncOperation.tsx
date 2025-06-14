import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface UseAsyncOperationOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface AsyncOperationState {
  isLoading: boolean;
  error: Error | null;
}

export function useAsyncOperation<T extends unknown[], R>(
  operation: (...args: T) => Promise<R>,
  options: UseAsyncOperationOptions = {}
) {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    errorMessage,
  } = options;

  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      setState({ isLoading: true, error: null });

      try {
        const result = await operation(...args);
        
        setState({ isLoading: false, error: null });
        
        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }
        
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error occurred');
        
        setState({ isLoading: false, error: err });
        
        logger.error('Async operation failed:', err);
        
        if (showErrorToast) {
          toast.error(errorMessage || err.message || 'Operation failed');
        }
        
        return null;
      }
    },
    [operation, showErrorToast, showSuccessToast, successMessage, errorMessage]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}