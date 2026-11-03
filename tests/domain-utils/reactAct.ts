import { act } from 'react';

// Returning a Promise selects the async act overload and flushes pending effects.
export function flushReact(callback: () => void): Promise<void> {
  return act(() => {
    callback();
    return Promise.resolve();
  });
}
