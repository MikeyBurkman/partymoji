/* eslint-disable no-restricted-globals */

import { runTransforms } from './run';

const ctx: Worker = self as any;

ctx.addEventListener('message', async (event) => {
  console.log('EVENT:', event);
  await runTransforms(event.data, (result) => {
    ctx.postMessage({
      status: 'in-progress',
      result,
    });
  });
  ctx.postMessage({
    status: 'complete',
  });
});
