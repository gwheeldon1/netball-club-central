// Clean console statements across the application
// This file replaces all console.log, console.error, etc. with proper logging

import { logger } from './logger';

// Production-safe console replacement
export const cleanConsole = {
  log: (...args: unknown[]) => logger.debug(String(args[0]), ...args.slice(1)),
  error: (...args: unknown[]) => logger.error(String(args[0]), ...args.slice(1)),
  warn: (...args: unknown[]) => logger.warn(String(args[0]), ...args.slice(1)),
  info: (...args: unknown[]) => logger.info(String(args[0]), ...args.slice(1)),
  debug: (...args: unknown[]) => logger.debug(String(args[0]), ...args.slice(1)),
};

// Replace global console in production
if (!import.meta.env.DEV) {
  (window as any).console = cleanConsole;
}