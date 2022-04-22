import { Result, RunArgs } from './run';
// @ts-ignore
import RunTransformWorker from './transform.worker';

export const runTransformsAsync = (
  args: RunArgs,
  cb: (result: Result) => void
) =>
  new Promise<void>((resolve, reject) => {
    const worker = new RunTransformWorker();

    // worker.addEventListener('message', (a: any) => {
    //   console.log('Received message', a);
    // });

    worker.addEventListener('error', reject);

    worker.addEventListener('messageerror', reject);

    worker.onmessage = (event: any) => {
      // See transform.worker.ts for what messages look like
      const data = event.data;
      if (data.status === 'in-progress') {
        cb(data.result);
      } else {
        resolve();
      }
    };

    worker.postMessage(args);
  });
