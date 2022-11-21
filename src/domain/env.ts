// DO NOT IMPORT THIS FILE FROM A WEB WORKER
// Web workers do not have access to `window`

import MobileDetect from 'mobile-detect';

export const IS_MOBILE =
  new MobileDetect(window.navigator.userAgent).mobile() != null;

export const ENV = (window as any).ENV as 'DEV' | 'PROD';

export const debugLog = ENV === 'DEV' ? console.log : () => undefined;
