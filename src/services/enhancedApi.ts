import { useState, useCallback, useRef, useEffect } from 'react';
import { RateLimiter, sanitizeInput } from '@/utils/security';
import { useRetry, useCircuitBreaker } from '@/hooks/useRetry';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface ApiCallOptions {
  timeout?: number;
  retryConfig?: {
    maxAttempts: number;
    baseDelay: number;
  };
  rateLimit?: {
    requestsPerMinute: number;
    burstLimit: number;
  };
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Enhanced API service with retry logic, circuit breaker, and error handling
 */
export class EnhancedApiService {
  private baseUrl: string;
  private defaultTimeout: number;
  private rateLimiter: RateLimiter;
  private activeRequests = new Map<string, AbortController>();

  constructor(baseUrl: string = '', options: ApiCallOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = options.timeout || 30000;
    
    const rateLimit = options.rateLimit || { requestsPerMinute: 60, burstLimit: 10 };
    this.rateLimiter = new RateLimiter(
      rateLimit.burstLimit,
      rateLimit.requestsPerMinute / 60
    );
  }

  public async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    apiOptions: ApiCallOptions = {}
  ): Promise<ApiResponse<T>> {
    // Check rate limit
    if (!this.rateLimiter.canProceed()) {
      const waitTime = this.rateLimiter.getWaitTime();
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`);
    }

    const requestKey = `${options.method || 'GET'}_${url}`;
    
    // Cancel any existing request with the same key
    if (this.activeRequests.has(requestKey)) {
      this.activeRequests.get(requestKey)?.abort();
    }

    const controller = new AbortController();
    this.activeRequests.set(requestKey, controller);

    try {
      const timeout = apiOptions.timeout || this.defaultTimeout;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      this.activeRequests.delete(requestKey);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      this.activeRequests.delete(requestKey);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(url: string, options: ApiCallOptions = {}): Promise<T> {
    const response = await this.makeRequest<T>(url, { method: 'GET' }, options);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async post<T>(url: string, data: unknown, options: ApiCallOptions = {}): Promise<T> {
    const sanitizedData = this.sanitizeRequestData(data);
    
    const response = await this.makeRequest<T>(
      url,
      {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
      },
      options
    );
    
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async put<T>(url: string, data: unknown, options: ApiCallOptions = {}): Promise<T> {
    const sanitizedData = this.sanitizeRequestData(data);
    
    const response = await this.makeRequest<T>(
      url,
      {
        method: 'PUT',
        body: JSON.stringify(sanitizedData),
      },
      options
    );
    
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async delete<T>(url: string, options: ApiCallOptions = {}): Promise<T> {
    const response = await this.makeRequest<T>(url, { method: 'DELETE' }, options);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  private sanitizeRequestData(data: unknown): unknown {
    if (typeof data === 'string') {
      return sanitizeInput(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequestData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeRequestData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  cancelAll(): void {
    for (const controller of this.activeRequests.values()) {
      controller.abort();
    }
    this.activeRequests.clear();
  }

  cancelRequest(method: string, url: string): void {
    const requestKey = `${method}_${url}`;
    const controller = this.activeRequests.get(requestKey);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestKey);
    }
  }
}

/**
 * Hook for using enhanced API service with retry and circuit breaker
 */
export function useEnhancedApi(baseUrl?: string) {
  const apiServiceRef = useRef<EnhancedApiService>();
  
  if (!apiServiceRef.current) {
    apiServiceRef.current = new EnhancedApiService(baseUrl);
  }

  const { execute: executeWithRetry } = useRetry(
    async <T>(url: string, options: RequestInit = {}, apiOptions: ApiCallOptions = {}) => {
      return apiServiceRef.current!.makeRequest<T>(url, options, apiOptions);
    },
    { maxAttempts: 3, baseDelay: 1000 }
  );

  const { execute: executeWithCircuitBreaker } = useCircuitBreaker(
    executeWithRetry,
    5, // failure threshold
    60000 // recovery timeout
  );

  const makeSecureRequest = useCallback(
    async <T>(
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      url: string,
      data?: unknown,
      options: ApiCallOptions = {}
    ): Promise<T> => {
      try {
        logger.debug(`Making ${method} request to ${url}`);
        
        let result: T;
        switch (method) {
          case 'GET':
            result = await apiServiceRef.current!.get<T>(url, options);
            break;
          case 'POST':
            result = await apiServiceRef.current!.post<T>(url, data, options);
            break;
          case 'PUT':
            result = await apiServiceRef.current!.put<T>(url, data, options);
            break;
          case 'DELETE':
            result = await apiServiceRef.current!.delete<T>(url, options);
            break;
        }
        
        logger.debug(`${method} request to ${url} succeeded`);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
        logger.error(`${method} request to ${url} failed:`, errorMessage);
        
        // Show user-friendly error messages
        if (errorMessage.includes('Rate limit')) {
          toast.error('Too many requests. Please slow down.');
        } else if (errorMessage.includes('timeout')) {
          toast.error('Request timed out. Please try again.');
        } else if (errorMessage.includes('Network')) {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error('Something went wrong. Please try again.');
        }
        
        throw error;
      }
    },
    []
  );

  const cancelAllRequests = useCallback(() => {
    apiServiceRef.current?.cancelAll();
  }, []);

  const cancelRequest = useCallback((method: string, url: string) => {
    apiServiceRef.current?.cancelRequest(method, url);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      apiServiceRef.current?.cancelAll();
    };
  }, []);

  return {
    get: <T>(url: string, options?: ApiCallOptions) => 
      makeSecureRequest<T>('GET', url, undefined, options),
    post: <T>(url: string, data: unknown, options?: ApiCallOptions) => 
      makeSecureRequest<T>('POST', url, data, options),
    put: <T>(url: string, data: unknown, options?: ApiCallOptions) => 
      makeSecureRequest<T>('PUT', url, data, options),
    delete: <T>(url: string, options?: ApiCallOptions) => 
      makeSecureRequest<T>('DELETE', url, undefined, options),
    cancelAllRequests,
    cancelRequest,
  };
}