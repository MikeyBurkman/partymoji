import React from 'react';
import { RunArgs, runEffects } from '../domain/run';
import { runEffectsAsync } from '../domain/runAsync';
import { ImageEffectResult } from '../domain/types';
import { ENV, debugLog } from '../domain/env';

// Can't get web workers working with the dev build, so just use the synchrounous version
//  if not a prod build.
const run = ENV === 'DEV' ? runEffects : runEffectsAsync;

const getRunId = () => Math.floor(Math.random() * 100000);

/**
 * Computes effects for an image, calling the given callback when finished.
 *
 * If a compute is called while an existing one is in progress, then the
 *  result for the previous compute will be thrown away, and the callback will
 *  only be  called a single time.
 */
export const useEffectComputer = (
  onCompute: (imageEffectResult: ImageEffectResult) => void,
  onError?: (error: Error) => void
) => {
  const latestRunId = React.useRef<number>(0);

  const onFinish = (runId: number) => (data: ImageEffectResult) => {
    debugLog('Finished', { runId, latestRunId: latestRunId.current });
    if (runId === latestRunId.current) {
      onCompute(data);
    } else {
      // Throw away this result -- it's been superceded by another compute
      debugLog('Throwing away an old compute');
    }
  };

  return (args: RunArgs): void => {
    const runId = getRunId();
    debugLog('Computing: ', { runId, args });
    latestRunId.current = runId;
    run(args).then(onFinish(runId)).catch(onError);
  };
};
