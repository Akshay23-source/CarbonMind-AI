/**
 * Centralized Server Logging Utility
 */
export const logger = {
  info: (message, ...meta) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...meta);
  },
  warn: (message, ...meta) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...meta);
  },
  error: (message, error) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error?.message || error || '');
    if (error?.stack) {
      console.error(error.stack);
    }
  }
};

export default logger;
