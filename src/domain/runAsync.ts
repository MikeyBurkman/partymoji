import { RunArgs } from './RunArgs';
import { logger } from './utils';
import { ImageEffectResult } from './types';

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

const handleSuccess =
  (computationId: string) => (result: ImageEffectResult) => {
    const computation = computationMap.get(computationId);
    if (!computation) {
      return;
    }
    computation.resolve(result);
    computationMap.delete(computationId);
  };

export const runEffectsAsync = async (args: RunArgs) => {
  return new Promise<ImageEffectResult>((resolve, reject) => {
    const computationId = `${Date.now().toString()}-${Math.floor(
      Math.random() * 100000,
    ).toString()}`;
    computationMap.set(computationId, {
      resolve,
      reject,
    });

    const worker = new ComlinkWorker<typeof import('./effect.worker')>(
      new URL('./effect.worker', import.meta.url),
      {
        type: 'module',
      },
    );

    logger.info('Running effect ASYNC', {
      name: args.effectInput.effectName,
      params: args.effectInput.params,
    });

    worker
      .runEffectRPC(args)
      .then(handleSuccess(computationId), handleError(computationId));
  });
};
