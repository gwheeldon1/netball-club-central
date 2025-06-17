import { logger } from './logger';

/**
 * Performance monitoring utilities
 */

// Performance mark names
export const PERF_MARKS = {
  COMPONENT_RENDER: 'component-render',
  API_CALL: 'api-call',
  DATA_PROCESSING: 'data-processing',
  USER_INTERACTION: 'user-interaction',
} as const;

/**
 * Create a performance mark and measure execution time
 */
export function measurePerformance<T>(
  name: string,
  operation: () => T | Promise<T>
): T | Promise<T> {
  const markStart = `${name}-start`;
  const markEnd = `${name}-end`;
  
  performance.mark(markStart);
  
  const result = operation();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      performance.mark(markEnd);
      performance.measure(name, markStart, markEnd);
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure) {
        logger.debug(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
      }
      
      // Clean up marks
      performance.clearMarks(markStart);
      performance.clearMarks(markEnd);
      performance.clearMeasures(name);
    });
  } else {
    performance.mark(markEnd);
    performance.measure(name, markStart, markEnd);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    if (measure) {
      logger.debug(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
    }
    
    // Clean up marks
    performance.clearMarks(markStart);
    performance.clearMarks(markEnd);
    performance.clearMeasures(name);
    
    return result;
  }
}

/**
 * Decorator for measuring function performance
 */
export function performanceDecorator(name?: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;
    
    descriptor.value = function (...args: Parameters<T>) {
      return measurePerformance(measureName, () => 
        originalMethod?.apply(this, args)
      );
    } as T;
    
    return descriptor;
  };
}

/**
 * Memory usage monitoring
 */
export function logMemoryUsage(label?: string) {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    logger.debug(`Memory Usage ${label ? `(${label})` : ''}:`, {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
    });
  }
}

/**
 * Bundle size analyzer for development
 */
export function analyzeBundleSize() {
  if (import.meta.env.DEV) {
    // Analyze loaded modules
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const totalSize = scripts.reduce((size, script) => {
      const src = script.getAttribute('src');
      if (src && !src.startsWith('http')) {
        // This is a rough estimation - in production you'd use proper bundle analysis tools
        return size + 1;
      }
      return size;
    }, 0);
    
    logger.debug(`Estimated bundle chunks loaded: ${totalSize}`);
  }
}

/**
 * FPS monitor for performance tracking
 */
export class FPSMonitor {
  private frames = 0;
  private startTime = performance.now();
  private lastTime = this.startTime;
  private fps = 0;
  private rafId: number | null = null;

  start() {
    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getFPS(): number {
    return this.fps;
  }

  private tick() {
    this.frames++;
    const currentTime = performance.now();
    
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
      this.frames = 0;
      this.lastTime = currentTime;
      
      if (this.fps < 30) {
        logger.warn(`Low FPS detected: ${this.fps}`);
      }
    }
    
    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }
}

/**
 * Lazy loading utilities
 */
export function createLazyComponent<T>(
  componentImport: () => Promise<{ default: React.ComponentType<T> }>,
  _fallback?: React.ComponentType
) {
  return React.lazy(async () => {
    const start = performance.now();
    const component = await componentImport();
    const end = performance.now();
    
    logger.debug(`Lazy component loaded in ${(end - start).toFixed(2)}ms`);
    return component;
  });
}

/**
 * Image loading optimization
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

// React import for lazy component creation
import React from 'react';