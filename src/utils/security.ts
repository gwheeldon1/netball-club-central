/**
 * Input sanitization utilities for XSS prevention
 */

import { logger } from './logger';

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML entities to prevent XSS attacks
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize user input by removing potentially dangerous content
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML-like characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/style\s*=/gi, '') // Remove style attributes
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, ''); // Only allow alphanumeric, @, ., and -
}

/**
 * Sanitize phone number input
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone
    .replace(/[^\d+()-\s]/g, '') // Only allow digits, +, (), -, and spaces
    .trim();
}

/**
 * Sanitize filename for file uploads
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Remove multiple underscores
    .toLowerCase();
}

/**
 * Validate and sanitize URL input
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    
    return urlObj.toString();
  } catch {
    return null;
  }
}

/**
 * Rate limiting utility using token bucket algorithm
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / 1000) * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  canProceed(): boolean {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    
    return false;
  }

  getWaitTime(): number {
    this.refill();
    
    if (this.tokens >= 1) {
      return 0;
    }
    
    return Math.ceil((1 - this.tokens) / this.refillRate * 1000);
  }
}

/**
 * Content Security Policy utilities
 */
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'"],
  fontSrc: ["'self'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"],
} as const;

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabDirective} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Secure session storage utility
 */
export class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'netball_app_key';

  static setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      const encoded = btoa(serialized); // Simple encoding (not cryptographically secure)
      sessionStorage.setItem(key, encoded);
    } catch (error) {
      logger.warn('Failed to store item securely:', error);
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const encoded = sessionStorage.getItem(key);
      if (!encoded) return null;
      
      const serialized = atob(encoded);
      return JSON.parse(serialized);
    } catch (error) {
      logger.warn('Failed to retrieve item securely:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  static clear(): void {
    sessionStorage.clear();
  }
}

/**
 * Form submission security wrapper
 */
export function createSecureFormSubmission<T extends Record<string, any>>(
  rateLimiter: RateLimiter,
  sanitizer: (data: T) => T
) {
  return async (
    data: T,
    submitFn: (sanitizedData: T) => Promise<void>
  ): Promise<{ success: boolean; message?: string }> => {
    // Check rate limit
    if (!rateLimiter.canProceed()) {
      const waitTime = rateLimiter.getWaitTime();
      return {
        success: false,
        message: `Too many requests. Please wait ${Math.ceil(waitTime / 1000)} seconds.`
      };
    }

    try {
      // Sanitize input data
      const sanitizedData = sanitizer(data);
      
      // Submit form
      await submitFn(sanitizedData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Submission failed'
      };
    }
  };
}