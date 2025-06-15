import { logger } from './logger';

/**
 * Bundle analysis and performance monitoring utilities
 */

// Performance budgets (in KB)
export const PERFORMANCE_BUDGETS = {
  INITIAL_BUNDLE: 200, // 200KB for initial JS bundle
  TOTAL_BUNDLE: 1000,  // 1MB for total JS
  IMAGES: 500,         // 500KB for images per page
  FONTS: 100,          // 100KB for fonts
} as const;

interface BundleMetrics {
  jsSize: number;
  cssSize: number;
  imageSize: number;
  fontSize: number;
  chunkCount: number;
}

/**
 * Analyze current bundle size and performance
 */
export async function analyzeBundlePerformance(): Promise<BundleMetrics> {
  const metrics: BundleMetrics = {
    jsSize: 0,
    cssSize: 0,
    imageSize: 0,
    fontSize: 0,
    chunkCount: 0,
  };

  try {
    // Analyze loaded resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resources.forEach((resource) => {
      const url = new URL(resource.name);
      const size = resource.transferSize || 0;
      
      if (url.pathname.endsWith('.js')) {
        metrics.jsSize += size;
        metrics.chunkCount++;
      } else if (url.pathname.endsWith('.css')) {
        metrics.cssSize += size;
      } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        metrics.imageSize += size;
      } else if (url.pathname.match(/\.(woff|woff2|ttf|otf)$/i)) {
        metrics.fontSize += size;
      }
    });

    // Convert to KB
    metrics.jsSize = Math.round(metrics.jsSize / 1024);
    metrics.cssSize = Math.round(metrics.cssSize / 1024);
    metrics.imageSize = Math.round(metrics.imageSize / 1024);
    metrics.fontSize = Math.round(metrics.fontSize / 1024);

    return metrics;
  } catch (error) {
    logger.error('Failed to analyze bundle performance:', error);
    return metrics;
  }
}

/**
 * Check if performance budgets are exceeded
 */
export function checkPerformanceBudgets(metrics: BundleMetrics): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (metrics.jsSize > PERFORMANCE_BUDGETS.INITIAL_BUNDLE) {
    violations.push(`JS bundle size (${metrics.jsSize}KB) exceeds budget (${PERFORMANCE_BUDGETS.INITIAL_BUNDLE}KB)`);
  }

  if (metrics.imageSize > PERFORMANCE_BUDGETS.IMAGES) {
    violations.push(`Image size (${metrics.imageSize}KB) exceeds budget (${PERFORMANCE_BUDGETS.IMAGES}KB)`);
  }

  if (metrics.fontSize > PERFORMANCE_BUDGETS.FONTS) {
    violations.push(`Font size (${metrics.fontSize}KB) exceeds budget (${PERFORMANCE_BUDGETS.FONTS}KB)`);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics(metrics: BundleMetrics) {
  const budget = checkPerformanceBudgets(metrics);
  
  logger.info('Bundle Performance Metrics:', {
    'JS Size': `${metrics.jsSize}KB`,
    'CSS Size': `${metrics.cssSize}KB`,
    'Image Size': `${metrics.imageSize}KB`,
    'Font Size': `${metrics.fontSize}KB`,
    'Chunk Count': metrics.chunkCount,
    'Budget Status': budget.passed ? '✅ PASSED' : '❌ FAILED',
  });

  if (!budget.passed) {
    budget.violations.forEach(violation => logger.warn(violation));
  }
}

/**
 * Monitor performance budgets in development
 */
export function initPerformanceMonitoring() {
  if (import.meta.env.DEV) {
    // Monitor after page load
    window.addEventListener('load', async () => {
      // Wait a bit for all resources to finish loading
      setTimeout(async () => {
        const metrics = await analyzeBundlePerformance();
        logPerformanceMetrics(metrics);
      }, 2000);
    });

    // Monitor on route changes (for SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(async () => {
          const metrics = await analyzeBundlePerformance();
          logPerformanceMetrics(metrics);
        }, 1000);
      }
    }).observe(document, { subtree: true, childList: true });
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  const criticalResources = [
    '/shot-tracker-main-logo.png',
    // Add other critical assets here
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.png') || resource.endsWith('.jpg') ? 'image' : 'fetch';
    document.head.appendChild(link);
  });
}