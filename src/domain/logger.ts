const logLevel: string =
  (import.meta.env.VITE_LOG_LEVEL as string | undefined) ?? 'debug';
const logLevels = ['error', 'warn', 'info', 'debug'];

console.info('Log level:', logLevel);

const logLevelIndex = logLevels.indexOf(logLevel);

export const logger = {
  error: (...args: unknown[]) => {
    if (logLevelIndex >= logLevels.indexOf('error')) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (logLevelIndex >= logLevels.indexOf('warn')) {
      console.warn(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (logLevelIndex >= logLevels.indexOf('info')) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (logLevelIndex >= logLevels.indexOf('debug')) {
      console.debug(...args);
    }
  },
};
