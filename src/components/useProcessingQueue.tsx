import React from 'react';
import { debugLog } from '../domain/env';

const getRunId = () => Math.floor(Math.random() * 100000);

/**
 * Computes an asynchronous, calling the given callback when finished.
 *
 * If a compute is called while an existing one is in progress, then the
 *  result for the previous compute will be thrown away. The callback will
 *  only be called a single time. Think of it like a debounce.
 */
export function useProcessingQueue<T, R>({
  fn,
  onComplete,
  onError,
}: {
  fn: (args: T) => Promise<R>;
  onComplete: (results: R) => void;
  onError?: (error: Error) => void;
}) {
  const latestRunId = React.useRef<number>(0);

  const onFinish = (runId: number) => (results: R) => {
    debugLog('Finished', { runId, latestRunId: latestRunId.current });
    if (runId === latestRunId.current) {
      onComplete(results);
    } else {
      // Throw away this result -- it's been superceded by another compute
      debugLog('Throwing away an old compute');
    }
  };

  return React.useCallback((args: T): void => {
    const runId = getRunId();
    debugLog('Computing: ', { runId, args });
    latestRunId.current = runId;
    fn(args).then(onFinish(runId)).catch(onError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // TODO use React memo everywhere so we can do this properly?
}
