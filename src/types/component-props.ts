// Component prop types to replace 'any' usage
import { ReactNode } from 'react';

// Crop area types for FileUpload component
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropAreaPixels extends CropArea {
  // Pixel-based crop coordinates
}

// Calendar toolbar props
export interface CalendarToolbarProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: 'month' | 'week' | 'day' | 'agenda') => void;
}

// Generic async function type
export type AsyncFunction<TArgs extends readonly unknown[] = readonly unknown[], TReturn = unknown> = 
  (...args: TArgs) => Promise<TReturn>;

// Performance decorator target type
export interface PerformanceTarget {
  [key: string]: AsyncFunction;
}

// Error handler types
export interface ErrorContext {
  component?: string;
  action?: string;
  data?: Record<string, unknown>;
}

// Conflict resolution types
export interface ConflictResolver<T = unknown> {
  (local: T, remote: T): T;
}

export interface SyncConflictData<T = unknown> {
  localData: T;
  remoteData: T;
  resolver?: ConflictResolver<T>;
}

// Form validation types
export interface ValidationRule<T = unknown> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export interface FormFieldState<T = unknown> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

// Storage utility types
export interface StorageValue {
  data: unknown;
  timestamp: number;
  ttl?: number;
}

// API update data interface
export interface ApiUpdateData {
  [key: string]: unknown;
}