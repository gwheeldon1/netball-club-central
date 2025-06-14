import { useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  onError?: (error: Error) => void;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logError = true,
    fallbackMessage = 'An unexpected error occurred',
    onError,
  } = options;

  const handleError = useCallback((error: unknown, context?: string) => {
    const errorMessage = getErrorMessage(error);
    const contextMessage = context ? `${context}: ${errorMessage}` : errorMessage;

    if (logError) {
      logger.error(contextMessage, error);
    }

    if (showToast) {
      toast.error(errorMessage || fallbackMessage);
    }

    if (onError && error instanceof Error) {
      onError(error);
    }

    return errorMessage;
  }, [showToast, logError, fallbackMessage, onError]);

  return { handleError };
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
}

// Specialized error handlers for different scenarios
export function useApiErrorHandler() {
  return useErrorHandler({
    showToast: true,
    logError: true,
    fallbackMessage: 'Failed to communicate with the server',
  });
}

export function useFormErrorHandler() {
  return useErrorHandler({
    showToast: true,
    logError: false, // Form errors are usually user-caused
    fallbackMessage: 'Please check your input and try again',
  });
}

export function useFileErrorHandler() {
  return useErrorHandler({
    showToast: true,
    logError: true,
    fallbackMessage: 'File operation failed',
  });
}

// Hook for handling async operations with error handling
export function useAsyncErrorHandler<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options?: ErrorHandlerOptions
): [T, boolean] {
  const { handleError } = useErrorHandler(options);

  const wrappedFn = useCallback(async (...args: Parameters<T>) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, asyncFn.name || 'Async operation');
      throw error;
    }
  }, [asyncFn, handleError]) as T;

  return [wrappedFn, false]; // Second value could be loading state if needed
}