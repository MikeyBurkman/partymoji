import { RunArgs } from './RunArgs';
import RunEffectWorker from './effect.worker?worker';
import { logger } from './logger';
import { AsyncRunMessage, ImageEffectResult } from './types';

interface Computation {
  resolve: (result: ImageEffectResult) => void;
  reject: (err: unknown) => void;
}

// The order of computations is not guaranteed, so add each computation to a map
const computationMap = new Map<string, Computation>();

const handleError = (computationId: string) => (error: unknown) => {
  const computation = computationMap.get(computationId);
  if (!computation) {
    return;
  }
  computation.reject(error);
  computationMap.delete(computationId);
};

const handleSuccess = (computationId: string, result: ImageEffectResult) => {
  const computation = computationMap.get(computationId);
  if (!computation) {
    return;
  }
  computation.resolve(result);
  computationMap.delete(computationId);
};

export const runEffectsAsync = (args: RunArgs) =>
  new Promise<ImageEffectResult>((resolve, reject) => {
    const worker = new RunEffectWorker();
    logger.info(
      'Running effect ASYNC, name:',
      args.effectInput.effectName,
      'params:',
      args.effectInput.params,
      'useWasm:',
      args.useWasm,
      'worker:',
      worker,
    );

    const computationId = `${Date.now().toString()}-${Math.floor(
      Math.random() * 100000,
    ).toString()}`;
    computationMap.set(computationId, {
      resolve,
      reject,
    });

    worker.addEventListener('error', handleError(computationId));
    worker.addEventListener('messageerror', handleError(computationId));

    worker.onmessage = (message: { data: AsyncRunMessage }) => {
      // See effect.worker.ts for what messages look like
      const data = message.data;
      if (data.status === 'complete') {
        handleSuccess(computationId, data.result);
      }
    };

    worker.postMessage(args);
  });
