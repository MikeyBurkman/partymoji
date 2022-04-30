import { RunArgs } from './run';
// @ts-ignore
import RunTransformWorker from './transform.worker';
import { AsyncRunMessage, ImageTransformResult } from './types';

export const runTransformsAsync = (
  args: RunArgs,
  cb: (result: ImageTransformResult) => void
) =>
  new Promise<void>((resolve, reject) => {
    const worker = new RunTransformWorker();

    // worker.addEventListener('message', (a: any) => {
    //   console.log('Received message', a);
    // });

    worker.addEventListener('error', reject);

    worker.addEventListener('messageerror', reject);

    worker.onmessage = (message: { data: AsyncRunMessage }) => {
      // See transform.worker.ts for what messages look like
      const data = message.data;
      if (data.status === 'in-progress') {
        cb(data.result);
      } else {
        resolve();
      }
    };

    worker.postMessage(args);
  });
