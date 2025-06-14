/**
 * Application-wide constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    BURST_LIMIT: 10,
  },
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 2 * 60 * 60 * 1000, // 2 hours
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
  KEYS: {
    USER_PROFILE: 'user_profile',
    TEAMS: 'teams',
    CHILDREN: 'children',
    EVENTS: 'events',
    SETTINGS: 'settings',
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  TOAST_DURATION: 4000,
  MODAL_ANIMATION_DURATION: 200,
  SCROLL_THRESHOLD: 100,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
} as const;

// File Upload Configuration
export const FILE_UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  COMPRESSION_QUALITY: 0.8,
  MAX_IMAGE_WIDTH: 1920,
  MAX_IMAGE_HEIGHT: 1080,
} as const;

// Date and Time Configuration
export const DATE_CONFIG = {
  FORMATS: {
    DATE: 'yyyy-MM-dd',
    TIME: 'HH:mm',
    DATETIME: 'yyyy-MM-dd HH:mm',
    DISPLAY_DATE: 'MMM dd, yyyy',
    DISPLAY_DATETIME: 'MMM dd, yyyy HH:mm',
  },
  TIMEZONE: 'Europe/London', // UK timezone
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  RATE_LIMIT: 'Too many requests. Please slow down.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created!',
  UPDATED: 'Successfully updated!',
  DELETED: 'Successfully deleted!',
  SAVED: 'Changes saved successfully!',
  SENT: 'Successfully sent!',
  UPLOADED: 'File uploaded successfully!',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  CACHE_PREFIX: 'cache_',
  OFFLINE_DATA: 'offline_data',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  OFFLINE_MODE: true,
  DARK_MODE: true,
  ANALYTICS: true,
  PUSH_NOTIFICATIONS: false,
  EXPERIMENTAL_FEATURES: false,
} as const;

// Breakpoints (matches Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;