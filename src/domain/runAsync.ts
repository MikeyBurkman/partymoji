import { RunArgs } from './RunArgs';
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
    const worker = new Worker(new URL('./effect.worker', import.meta.url), {
      type: 'module',
    });
    // const worker = new RunEffectWorker();
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

    worker.addEventListener('message', (message: { data: AsyncRunMessage }) => {
      logger.debug('Received message from worker:', message);
      // See effect.worker.ts for what messages look like
      const data = message.data;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- MIKE - status is hardcoded to 'complete'
      if (data.status === 'complete') {
        handleSuccess(computationId, data.result);
      } else {
        logger.error('Worker error:', data.error);
        handleError(computationId)(data.error);
      }
    });

    logger.info('Sending message to worker:', args);
    worker.postMessage(args);
  });
