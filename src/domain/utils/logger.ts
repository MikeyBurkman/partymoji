const LOG_LEVELS = ['error', 'warn', 'info', 'debug'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const logLevel =
  (import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined) ?? 'debug';

const logLevelIndex = LOG_LEVELS.indexOf(logLevel);

function buildLogger(level: LogLevel): (...args: Array<unknown>) => void {
  if (logLevelIndex >= LOG_LEVELS.indexOf(level)) {
    return (...args: Array<unknown>) => {
      console[level](...args);
    };
  } else {
    return () => null;
  }
}

export const logger = LOG_LEVELS.reduce(
  (acc, level) => {
    acc[level] = buildLogger(level);
    return acc;
  },
  {} as Record<LogLevel, (...args: Array<unknown>) => void>,
);
