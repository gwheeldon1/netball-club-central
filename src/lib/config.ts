// Feature flags and environment configuration
interface FeatureFlags {
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  enableSubscriptions: boolean;
  enableMatchStatistics: boolean;
  enableCalendarView: boolean;
  enableBulkOperations: boolean;
  enableExportFeatures: boolean;
  enableAdvancedReporting: boolean;
  enableRoleManagement: boolean;
  enableSystemMonitoring: boolean;
  enableAuditLog: boolean;
}

interface AppConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey?: string;
  environment: 'development' | 'staging' | 'production';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  features: FeatureFlags;
}

// Default feature flags
const defaultFeatures: FeatureFlags = {
  enableAnalytics: true,
  enableNotifications: true,
  enableOfflineMode: true,
  enableSubscriptions: false, // Disabled by default
  enableMatchStatistics: true,
  enableCalendarView: true,
  enableBulkOperations: false, // Disabled by default
  enableExportFeatures: false, // Disabled by default
  enableAdvancedReporting: false, // Disabled by default
  enableRoleManagement: true,
  enableSystemMonitoring: false, // Disabled by default
  enableAuditLog: false, // Disabled by default
};

// Environment-specific feature overrides
const developmentFeatures: Partial<FeatureFlags> = {
  enableBulkOperations: true,
  enableExportFeatures: true,
  enableAdvancedReporting: true,
  enableSystemMonitoring: true,
  enableAuditLog: true,
};

const productionFeatures: Partial<FeatureFlags> = {
  enableSubscriptions: true,
  enableAdvancedReporting: true,
};

function getAppEnvironment(): AppConfig['environment'] {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('staging') || hostname.includes('preview')) {
    return 'staging';
  }
  
  return 'production';
}

function getFeatureFlags(environment: AppConfig['environment']): FeatureFlags {
  let features = { ...defaultFeatures };
  
  switch (environment) {
    case 'development':
      features = { ...features, ...developmentFeatures };
      break;
    case 'production':
      features = { ...features, ...productionFeatures };
      break;
    case 'staging':
      // Staging uses default features
      break;
  }
  
  return features;
}

// Create app configuration
const environment = getAppEnvironment();
const isDevelopment = environment === 'development';
const isProduction = environment === 'production';

export const appConfig: AppConfig = {
  isDevelopment,
  isProduction,
  environment,
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  logLevel: (isDevelopment ? 'debug' : 'info') as AppConfig['logLevel'],
  features: getFeatureFlags(environment),
};

// Feature flag helper functions
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return appConfig.features[feature];
}

export function getCurrentFeatureFlags(): FeatureFlags {
  return appConfig.features;
}

// Environment helpers
export function isDev(): boolean {
  return appConfig.isDevelopment;
}

export function isProd(): boolean {
  return appConfig.isProduction;
}

export function getCurrentEnvironment(): string {
  return appConfig.environment;
}

// Configuration validation
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!appConfig.supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!appConfig.supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  if (appConfig.features.enableSubscriptions && !appConfig.stripePublishableKey) {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY is required when subscriptions are enabled');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Performance configuration
export const performanceConfig = {
  lazyLoadThreshold: 100,
  virtualScrollThreshold: 100,
  debounceDelay: 300,
  throttleDelay: 100,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Security configuration
export const securityConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'text/plain'],
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
} as const;

// UI configuration
export const uiConfig = {
  animations: {
    duration: 200,
    easing: 'ease-in-out',
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  sidebar: {
    width: 280,
    collapsedWidth: 64,
  },
  toast: {
    duration: 4000,
    position: 'bottom-right' as const,
  },
} as const;