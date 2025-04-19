const logLevel: string =
  (import.meta.env.VITE_LOG_LEVEL as string | undefined) ?? 'info';
const logLevels = ['error', 'warn', 'info', 'debug'];

console.info('Log level:', logLevel);

const logLevelIndex = logLevels.indexOf(logLevel);

export const logger = {
  error: (...args: Array<unknown>) => {
    if (logLevelIndex >= logLevels.indexOf('error')) {
      console.error(...args);
    }
  },
  warn: (...args: Array<unknown>) => {
    if (logLevelIndex >= logLevels.indexOf('warn')) {
      console.warn(...args);
    }
  },
  info: (...args: Array<unknown>) => {
    if (logLevelIndex >= logLevels.indexOf('info')) {
      console.info(...args);
    }
  },
  debug: (...args: Array<unknown>) => {
    if (logLevelIndex >= logLevels.indexOf('debug')) {
      console.debug(...args);
    }
  },
};
