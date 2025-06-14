import { useState, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  jitter: boolean;
}

interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError: Error | null;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true,
  jitter: true,
};

/**
 * Hook for implementing retry logic with exponential backoff
 */
export function useRetry<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  config: Partial<RetryConfig> = {}
) {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const [retryState, setRetryState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const calculateDelay = useCallback((attempt: number): number => {
    let delay = finalConfig.baseDelay;
    
    if (finalConfig.exponentialBackoff) {
      delay = Math.min(
        finalConfig.baseDelay * Math.pow(2, attempt - 1),
        finalConfig.maxDelay
      );
    }
    
    if (finalConfig.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return delay;
  }, [finalConfig]);

  const executeWithRetry = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      // Cancel any ongoing retry
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      setRetryState({ attempt: 0, isRetrying: false, lastError: null });

      for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
        if (signal.aborted) {
          throw new Error('Operation was cancelled');
        }

        setRetryState(prev => ({ ...prev, attempt, isRetrying: attempt > 1 }));

        try {
          const result = await operation(...args);
          setRetryState({ attempt, isRetrying: false, lastError: null });
          logger.debug(`Operation succeeded on attempt ${attempt}`);
          return result;
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Unknown error');
          setRetryState(prev => ({ ...prev, lastError: err }));
          
          logger.warn(`Operation failed on attempt ${attempt}:`, err.message);

          // Don't retry on certain errors
          if (shouldNotRetry(err)) {
            throw err;
          }

          // If this was the last attempt, throw the error
          if (attempt === finalConfig.maxAttempts) {
            logger.error(`Operation failed after ${attempt} attempts:`, err);
            throw err;
          }

          // Wait before retrying
          const delay = calculateDelay(attempt);
          logger.debug(`Retrying in ${delay}ms...`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      throw new Error('Maximum retry attempts exceeded');
    },
    [operation, finalConfig, calculateDelay]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setRetryState({ attempt: 0, isRetrying: false, lastError: null });
    }
  }, []);

  return {
    execute: executeWithRetry,
    cancel,
    ...retryState,
  };
}

/**
 * Determine if an error should not be retried
 */
function shouldNotRetry(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  // Don't retry on authentication errors
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return true;
  }
  
  // Don't retry on validation errors
  if (message.includes('validation') || message.includes('invalid')) {
    return true;
  }
  
  // Don't retry on not found errors
  if (message.includes('not found')) {
    return true;
  }
  
  return false;
}

/**
 * Hook for circuit breaker pattern to prevent cascading failures
 */
export function useCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  failureThreshold: number = 5,
  recoveryTimeout: number = 60000
) {
  const [state, setState] = useState<'closed' | 'open' | 'half-open'>('closed');
  const [failureCount, setFailureCount] = useState(0);
  const [lastFailureTime, setLastFailureTime] = useState<number | null>(null);

  const executeWithCircuitBreaker = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      // Check if circuit should be half-open
      if (state === 'open' && lastFailureTime) {
        if (Date.now() - lastFailureTime > recoveryTimeout) {
          setState('half-open');
          setFailureCount(0);
        } else {
          throw new Error('Circuit breaker is open - operation not allowed');
        }
      }

      // If circuit is open, reject immediately
      if (state === 'open') {
        throw new Error('Circuit breaker is open - operation not allowed');
      }

      try {
        const result = await operation(...args);
        
        // Success - reset circuit breaker
        if (state !== 'closed') {
          setState('closed');
          setFailureCount(0);
          setLastFailureTime(null);
          logger.info('Circuit breaker closed - service recovered');
        }
        
        return result;
      } catch (error) {
        const newFailureCount = failureCount + 1;
        setFailureCount(newFailureCount);
        setLastFailureTime(Date.now());

        // Open circuit if threshold reached
        if (newFailureCount >= failureThreshold) {
          setState('open');
          logger.error(`Circuit breaker opened after ${newFailureCount} failures`);
          toast.error('Service temporarily unavailable. Please try again later.');
        }

        throw error;
      }
    },
    [operation, state, failureCount, lastFailureTime, failureThreshold, recoveryTimeout]
  );

  return {
    execute: executeWithCircuitBreaker,
    state,
    failureCount,
    reset: () => {
      setState('closed');
      setFailureCount(0);
      setLastFailureTime(null);
    },
  };
}