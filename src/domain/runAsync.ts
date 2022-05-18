import { RunArgs } from './run';
// @ts-ignore
import RunTransformWorker from './transform.worker';
import { AsyncRunMessage, ImageTransformResult } from './types';

export const runTransformsAsync = (args: RunArgs) =>
  new Promise<ImageTransformResult>((resolve, reject) => {
    const worker = new RunTransformWorker();

    worker.addEventListener('error', reject);
    worker.addEventListener('messageerror', reject);

    worker.onmessage = (message: { data: AsyncRunMessage }) => {
      // See transform.worker.ts for what messages look like
      const data = message.data;
      if (data.status === 'complete') {
        resolve(data.result);
      }
    };

    worker.postMessage(args);
  });
