import React from 'react';
import { logger } from '~/domain/utils';

interface InitProps<TArgs, TRet> {
  processFn: (
    args: TArgs,
    onProgress: (ret: TRet) => void,
  ) => TRet | Promise<TRet>;
  onProgress?: (ret: TRet) => void;
  onComplete: (ret: TRet) => void;
  onError?: (err: Error) => void;
}

/**
 * Computes an asynchronous function, calling the given callback when finished.
 *
 * If a compute is called while an existing one is in progress, then the
 *  result for the previous compute will be thrown away. The callback will
 *  only be called a single time. Think of it like an async debounce.
 */
export function useProcessingQueue<TArgs, TRet>({
  processFn,
  onProgress,
  onComplete,
  onError,
}: InitProps<TArgs, TRet>) {
  // Progress and completion from superseded runs must both be ignored.
  const latestRunIdRef = React.useRef(0);
  const cancel = React.useCallback(() => {
    latestRunIdRef.current += 1;
  }, []);

  React.useEffect(() => cancel, [cancel]);

  const compute = React.useCallback(
    (args: TArgs): void => {
      const runId = ++latestRunIdRef.current;
      logger.debug('Computing: ', { runId, args });
      void Promise.resolve(
        processFn(args, (result) => {
          if (runId === latestRunIdRef.current) {
            onProgress?.(result);
          }
        }),
      )
        .then((results) => {
          logger.debug('Finished processing', {
            runId,
            latestRunId: latestRunIdRef.current,
          });
          if (runId === latestRunIdRef.current) {
            onComplete(results);
          } else {
            // Throw away this result -- it's been superseded by another compute
            logger.debug('Throwing away an old compute');
          }
        })
        .catch(onError);
    },
    [processFn, onProgress, onError, onComplete],
  );

  return { compute, cancel };
}
