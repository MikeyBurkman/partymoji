import { runEffects } from './run';
import { RunArgs } from './RunArgs';
import { ImageEffectResult } from './types';

export async function runEffectRPC(args: RunArgs): Promise<ImageEffectResult> {
  return await runEffects(args);
}
