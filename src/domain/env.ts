// DO NOT IMPORT THIS FILE FROM A WEB WORKER
// Web workers do not have access to `window`

import MobileDetect from 'mobile-detect';

export const IS_MOBILE =
  new MobileDetect(window.navigator.userAgent).mobile() != null;

export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;

export const debugLog = IS_DEV ? console.log : () => undefined;
