import { endpointSymbol } from 'vite-plugin-comlink/symbol';
import { RunArgs } from './RunArgs';
import { logger } from './utils';
import { ImageEffectResult } from './types';

type EffectWorker = InstanceType<
  typeof ComlinkWorker<typeof import('./effect.worker')>
>;

interface WorkerSession {
  api: EffectWorker;
  pending: Set<(error: Error) => void>;
  removeListeners: () => void;
}

let session: WorkerSession | undefined;

const stopWorker = (current: WorkerSession, error: Error) => {
  if (session === current) session = undefined;
  current.removeListeners();
  current.api[endpointSymbol].terminate();
  for (const reject of current.pending) reject(error);
  current.pending.clear();
};

const getWorker = (): WorkerSession => {
  if (session) return session;

  const api = new ComlinkWorker<typeof import('./effect.worker')>(
    new URL('./effect.worker', import.meta.url),
    { type: 'module' },
  );
  const worker = api[endpointSymbol];
  const onError = (event: ErrorEvent) => {
    stopWorker(current, new Error(event.message || 'Effect worker failed'));
  };
  const onMessageError = () => {
    stopWorker(
      current,
      new Error('Unable to deserialize effect worker message'),
    );
  };
  const current: WorkerSession = {
    api,
    pending: new Set(),
    removeListeners: () => {
      worker.removeEventListener('error', onError);
      worker.removeEventListener('messageerror', onMessageError);
    },
  };
  worker.addEventListener('error', onError);
  worker.addEventListener('messageerror', onMessageError);
  session = current;
  return current;
};

const disposeWorker = () => {
  if (session) stopWorker(session, new Error('Effect worker stopped'));
};

// pagehide also covers the back/forward cache; a later call recreates the worker.
window.addEventListener('pagehide', disposeWorker);
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('pagehide', disposeWorker);
    disposeWorker();
  });
}

export const runEffectsAsync = async (
  args: RunArgs,
): Promise<ImageEffectResult> => {
  const current = getWorker();
  logger.info('Running effect ASYNC', {
    name: args.effectInput.effectName,
    params: args.effectInput.params,
  });

  // Comlink routes each RPC response. Track rejects only so a fatal worker
  // error or shutdown settles every outstanding call instead of leaving it hung.
  return new Promise<ImageEffectResult>((resolve, reject) => {
    current.pending.add(reject);
    const fail = (error: unknown) => {
      current.pending.delete(reject);
      reject(error instanceof Error ? error : new Error(String(error)));
    };
    try {
      void current.api.runEffectRPC(args).then((result) => {
        current.pending.delete(reject);
        resolve(result);
      }, fail);
    } catch (error) {
      fail(error);
    }
  });
};
