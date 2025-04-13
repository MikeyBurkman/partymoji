import React from 'react';
import { logger } from './logger';
import { computeGif } from '~/domain/computeGifs';
import type { ImageEffectResult } from '~/domain/types';
import { RunArgs } from './RunArgs';

const getRunId = () => Math.floor(Math.random() * 100000);

interface ContextProps {
  latestRunIdRef: React.RefObject<number>;
}

const ProcessorQueueContext = React.createContext<ContextProps>({
  // eslint-disable-next-line
  latestRunIdRef: null as any, // Will be set immediately in the provider
});

export const ProcessorQueueProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const latestRunIdRef = React.useRef(0);

  return (
    <ProcessorQueueContext.Provider value={{ latestRunIdRef }}>
      {children}
    </ProcessorQueueContext.Provider>
  );
};

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
  const { latestRunIdRef } = React.useContext(ProcessorQueueContext);

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
