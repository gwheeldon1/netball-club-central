
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState, useEffect, startTransition } from 'react';
import { logger } from '@/utils/logger';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  // Performance optimizations
  enableBackgroundRefetch?: boolean;
  debounceMs?: number;
  retryDelay?: number;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  enableBackgroundRefetch = true,
  debounceMs = 0,
  retryDelay = 1000,
  ...options
}: OptimizedQueryOptions<T>) {
  const [debouncedEnabled, setDebouncedEnabled] = useState(options.enabled !== false);

  // Debounce enabled state for frequent toggle scenarios
  useEffect(() => {
    if (debounceMs > 0) {
      const timeout = setTimeout(() => {
        startTransition(() => {
          setDebouncedEnabled(options.enabled !== false);
        });
      }, debounceMs);
      return () => clearTimeout(timeout);
    } else {
      startTransition(() => {
        setDebouncedEnabled(options.enabled !== false);
      });
    }
  }, [options.enabled, debounceMs]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const startTime = Date.now();
      try {
        const result = await queryFn();
        const duration = Date.now() - startTime;
        
        // Log slow queries for optimization
        if (duration > 2000) {
          logger.warn(`Slow query detected: ${queryKey.join('.')} took ${duration}ms`);
        }
        
        return result;
      } catch (error) {
        logger.error(`Query failed: ${queryKey.join('.')}`, error);
        throw error;
      }
    },
    enabled: debouncedEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: enableBackgroundRefetch,
    refetchOnMount: 'always',
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes('auth')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(retryDelay * Math.pow(2, attemptIndex), 30000),
    ...options,
  });
}

// Specialized hooks for common patterns
export function useOptimizedListQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T[]>,
  options?: Partial<OptimizedQueryOptions<T[]>>
) {
  return useOptimizedQuery({
    queryKey,
    queryFn,
    select: (data) => data || [], // Ensure we always return an array
    ...options,
  });
}

export function useOptimizedSingleQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T | null>,
  options?: Partial<OptimizedQueryOptions<T | null>>
) {
  return useOptimizedQuery({
    queryKey,
    queryFn,
    retry: 1, // Single items fail faster
    ...options,
  });
}

// Hook for paginated data
export function useOptimizedPaginatedQuery<T>(
  queryKey: string[],
  queryFn: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  page: number = 1,
  limit: number = 10,
  options?: Partial<OptimizedQueryOptions<{ data: T[]; total: number }>>
) {
  return useOptimizedQuery({
    queryKey: [...queryKey, 'page', page.toString(), 'limit', limit.toString()],
    queryFn: () => queryFn(page, limit),
    placeholderData: (prev) => prev, // Keep previous data during refetch
    ...options,
  });
}
