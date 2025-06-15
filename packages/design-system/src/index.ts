// Export design system configuration and utilities

// Tailwind configuration
export { default as tailwindConfig } from './tailwind.config';

// Theme configuration
export * from './theme/colors';
export * from './theme/typography';
export * from './theme/spacing';
export * from './theme/breakpoints';

// CSS utilities
export * from './css/variables';
export * from './css/utilities';

// Component variants
export * from './variants/button';
export * from './variants/input';
export * from './variants/card';
export * from './variants/badge';

// Design tokens
export * from './tokens/colors';
export * from './tokens/fonts';
export * from './tokens/shadows';
export * from './tokens/radius';

// Utility functions
export { cn } from './utils/className';
export * from './utils/theme';