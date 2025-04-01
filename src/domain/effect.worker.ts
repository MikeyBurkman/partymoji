import { runEffects } from './run';
import { RunArgs } from './RunArgs';
import { AsyncRunMessage } from './types';

const ctx: Worker = self as any;

ctx.addEventListener('message', async (event: MessageEvent<RunArgs>) => {
  const result = await runEffects(event.data);

  const message: AsyncRunMessage = {
    status: 'complete',
    result,
  };
  ctx.postMessage(message);
});
