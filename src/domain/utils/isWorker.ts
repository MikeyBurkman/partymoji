// When in a web worker, the window isn't defined.
export const IS_WORKER = typeof window === 'undefined';
