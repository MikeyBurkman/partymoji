/* eslint-disable no-restricted-globals */

import { runEffects } from './run';
import { AsyncRunMessage } from './types';

const ctx: Worker = self as any;

ctx.addEventListener('message', async (event) => {
  const result = await runEffects(event.data);

  const message: AsyncRunMessage = {
    status: 'complete',
    result,
  };
  ctx.postMessage(message);
});
