/* eslint-disable no-restricted-globals */

import { runTransforms } from './run';
import { AsyncRunMessage } from './types';

const ctx: Worker = self as any;

ctx.addEventListener('message', async (event) => {
  await runTransforms(event.data, (result) => {
    const message: AsyncRunMessage = {
      status: 'in-progress',
      result,
    };
    ctx.postMessage(message);
  });

  const message: AsyncRunMessage = {
    status: 'complete',
  };
  ctx.postMessage(message);
});
