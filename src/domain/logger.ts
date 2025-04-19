const logLevel: string =
  (import.meta.env.VITE_LOG_LEVEL as string | undefined) ?? 'debug';
const logLevels = ['error', 'warn', 'info', 'debug'];

console.info('Log level:', logLevel);

export const logger = {
  error: (...args: any[]) => {
    if (logLevels.indexOf(logLevel) >= logLevels.indexOf('error')) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (logLevels.indexOf(logLevel) >= logLevels.indexOf('warn')) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (logLevels.indexOf(logLevel) >= logLevels.indexOf('info')) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (logLevels.indexOf(logLevel) >= logLevels.indexOf('debug')) {
      console.debug(...args);
    }
  },
};
