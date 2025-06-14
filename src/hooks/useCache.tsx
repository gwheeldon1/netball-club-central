import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface UseCacheOptions {
  defaultTTL?: number; // Time to live in milliseconds
  maxSize?: number;
}

export function useCache<T>(options: UseCacheOptions = {}) {
  const { defaultTTL = 5 * 60 * 1000, maxSize = 100 } = options; // 5 minutes default TTL
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());

  const set = useCallback((key: string, data: T, ttl: number = defaultTTL) => {
    setCache(prev => {
      const newCache = new Map(prev);
      
      // Remove oldest entries if cache is at max size
      if (newCache.size >= maxSize) {
        const oldestKey = newCache.keys().next().value;
        newCache.delete(oldestKey);
      }

      newCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });

      return newCache;
    });
  }, [defaultTTL, maxSize]);

  const get = useCallback((key: string): T | null => {
    const entry = cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }

    return entry.data;
  }, [cache]);

  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);

  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  const getOrSet = useCallback(async (
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const cached = get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetcher();
      set(key, data, ttl);
      return data;
    } catch (error) {
      logger.error(`Error fetching data for cache key ${key}:`, error);
      throw error;
    }
  }, [get, set]);

  // Cleanup expired entries periodically
  const cleanup = useCallback(() => {
    const now = Date.now();
    setCache(prev => {
      const newCache = new Map();
      
      for (const [key, entry] of prev.entries()) {
        if (now - entry.timestamp <= entry.ttl) {
          newCache.set(key, entry);
        }
      }
      
      return newCache;
    });
  }, []);

  return {
    set,
    get,
    has,
    remove,
    clear,
    getOrSet,
    cleanup,
    size: cache.size
  };
}