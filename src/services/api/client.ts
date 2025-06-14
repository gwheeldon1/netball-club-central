// Unified API client with retry logic and error handling
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from '@/services/database';
import { logger } from '@/utils/logger';
import { ApiError, ApiResponse, ApiConfig } from './types';

export class ApiClient {
  private config: Required<ApiConfig>;
  private isOnline: boolean = navigator.onLine;

  constructor(config: ApiConfig = {}) {
    this.config = {
      baseUrl: '',
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      enableOffline: true,
      ...config,
    };

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('API client: Back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info('API client: Gone offline');
    });
  }

  // Generic request method with retry logic
  async request<T>(
    operation: () => Promise<T>,
    operationName: string,
    allowOffline: boolean = true
  ): Promise<ApiResponse<T>> {
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        // If offline and offline mode is enabled, queue the operation
        if (!this.isOnline && this.config.enableOffline && allowOffline) {
          logger.warn(`API client: Offline, operation ${operationName} queued`);
          throw new ApiError('Offline - operation queued', 0, 'OFFLINE');
        }

        const result = await this.withTimeout(operation(), this.config.timeout);
        
        return {
          data: result,
          success: true,
        };
      } catch (error) {
        const isLastAttempt = attempt === this.config.retries;
        
        if (error instanceof ApiError) {
          if (error.code === 'OFFLINE') {
            return {
              error: 'Currently offline - changes will sync when online',
              success: false,
            };
          }
        }

        logger.error(`API client: ${operationName} attempt ${attempt} failed:`, error);

        if (isLastAttempt) {
          return {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            success: false,
          };
        }

        // Wait before retry with exponential backoff
        await this.delay(this.config.retryDelay * attempt);
      }
    }

    return {
      error: 'All retry attempts failed',
      success: false,
    };
  }

  // Supabase query wrapper
  async supabaseQuery<T>(
    queryBuilder: any,
    operationName: string,
    allowOffline: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.request(async () => {
      const { data, error } = await queryBuilder;
      
      if (error) {
        throw new ApiError(error.message, error.code);
      }
      
      return data;
    }, operationName, allowOffline);
  }

  // Check if online
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Private helper methods
  private async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new ApiError('Request timeout', 408, 'TIMEOUT')), timeout)
      ),
    ]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const apiClient = new ApiClient();