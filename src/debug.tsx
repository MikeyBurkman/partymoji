const DEBUG = false;

export const isDebug = () => DEBUG;

export const debugLog = DEBUG ? console.log : () => undefined;
