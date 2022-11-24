import React from 'react';

export const useEffectAsync = (cb: () => Promise<unknown>, deps: unknown[]) =>
  React.useEffect(() => {
    cb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
