import { runEffects } from './run';
import { RunArgs } from './RunArgs';
import { AsyncRunMessage } from './types';

export async function runEffectRPC(args: RunArgs): Promise<AsyncRunMessage> {
  console.log('MESSAGE', args);

  const result = await runEffects(args);
  return {
    status: 'complete',
    result,
  };
}
