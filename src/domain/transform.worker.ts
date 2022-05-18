/* eslint-disable no-restricted-globals */

import { runTransforms } from './run';
import { AsyncRunMessage } from './types';

const ctx: Worker = self as any;

ctx.addEventListener('message', async (event) => {
  const result = await runTransforms(event.data);

  const message: AsyncRunMessage = {
    status: 'complete',
    result,
  };
  ctx.postMessage(message);
});
