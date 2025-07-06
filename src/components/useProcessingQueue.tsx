import React from 'react';
import { logger } from '~/domain/utils';

interface InitProps<TArgs, TRet> {
  processFn: (args: TArgs) => TRet | Promise<TRet>;
  onComplete: (ret: TRet) => void;
  onError?: (err: Error) => void;
}

type ComputeFn<TArgs> = (args: TArgs) => void;

/**
 * Computes an asynchronous function, calling the given callback when finished.
 *
 * If a compute is called while an existing one is in progress, then the
 *  result for the previous compute will be thrown away. The callback will
 *  only be called a single time. Think of it like an async debounce.
 */
export function useProcessingQueue<TArgs, TRet>({
  processFn,
  onComplete,
  onError,
}: InitProps<TArgs, TRet>): ComputeFn<TArgs> {
  // Each compute gets a unique(-ish) ID. If we finish computing and
  //  that compute's ID doesn't match our current one, then we drop that result.
  const latestRunIdRef = React.useRef(0);

  return React.useCallback(
    (args): void => {
      const runId = Math.floor(Math.random() * 1000000);
      logger.debug('Computing: ', { runId, args });
      latestRunIdRef.current = runId;
      void Promise.resolve(processFn(args))
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
    [processFn, onError, onComplete],
  );
}
