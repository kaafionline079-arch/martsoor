type LogContext = Record<string, unknown>;

/**
 * Lightweight logger — silent in production except errors.
 * Swap for Sentry/Crashlytics when a backend is introduced.
 */
export const logger = {
  info(message: string, context?: LogContext) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.info(`[Martisoor] ${message}`, context ?? '');
    }
  },
  warn(message: string, context?: LogContext) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[Martisoor] ${message}`, context ?? '');
    }
  },
  error(message: string, context?: LogContext) {
    // Keep errors visible in prod builds for local debugging;
    // replace with crash reporting before store release.
    // eslint-disable-next-line no-console
    console.error(`[Martisoor] ${message}`, context ?? '');
  },
};
