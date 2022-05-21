import { RunArgs } from './run';
// @ts-ignore
import RunEffectWorker from './effect.worker';
import { AsyncRunMessage, ImageEffectResult } from './types';

export const runEffectsAsync = (args: RunArgs) =>
  new Promise<ImageEffectResult>((resolve, reject) => {
    const worker = new RunEffectWorker();

    worker.addEventListener('error', reject);
    worker.addEventListener('messageerror', reject);

    worker.onmessage = (message: { data: AsyncRunMessage }) => {
      // See effect.worker.ts for what messages look like
      const data = message.data;
      if (data.status === 'complete') {
        resolve(data.result);
      }
    };

    worker.postMessage(args);
  });
