import type { JsonType, ParamFnDefault, ParamFunction } from '~/domain/types';

export const toParamFunction = <T extends JsonType>(
  x: ParamFnDefault<T>,
): ParamFunction<T>['defaultValue'] => {
  if (typeof x === 'function') {
    return x;
  }
  return () => x;
};
