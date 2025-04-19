import React from 'react';
import { computeGif } from '~/domain/computeGifs';
import { RunArgs } from '~/domain/RunArgs';
import type { ImageEffectResult } from '~/domain/types';
import { ProcessorQueueContext } from './ProcessorQueueContext';
import { logger } from '~/domain/logger';

const getRunId = () => Math.floor(Math.random() * 100000);

/**
 * Computes an asynchronous, calling the given callback when finished.
 *
 * If a compute is called while an existing one is in progress, then the
 *  result for the previous compute will be thrown away. The callback will
 *  only be called a single time. Think of it like a debounce.
 */

export function useProcessingQueue({
  onComplete,
  onError,
}: {
  onComplete: (results: ImageEffectResult) => void;
  onError?: (error: Error) => void;
}) {
  const { latestRunIdRef } = React.use(ProcessorQueueContext);

  const onFinish = React.useCallback(
    (runId: number, results: ImageEffectResult) => {
      logger.debug('Finished', { runId, latestRunIdRef });
      if (runId === latestRunIdRef.current) {
        onComplete(results);
      } else {
        // Throw away this result -- it's been superceded by another compute
        logger.debug('Throwing away an old compute');
      }
    },
    [onComplete, latestRunIdRef],
  );

  return React.useCallback(
    (args: RunArgs): void => {
      const runId = getRunId();
      logger.debug('Computing: ', { runId, args });
      latestRunIdRef.current = runId;
      void computeGif(args)
        .then((results) => {
          onFinish(runId, results);
        })
        .catch(onError);
    },
    [onError, onFinish, latestRunIdRef],
  );
}
