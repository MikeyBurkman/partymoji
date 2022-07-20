// DO NOT IMPORT THIS FILE FROM A WEB WORKER
// Web workers do not have access to `window`

export const ENV = (window as any).ENV as 'DEV' | 'PROD';

export const debugLog = ENV === 'DEV' ? console.log : () => undefined;
