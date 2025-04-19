import { logger } from './utils';
import { runEffects } from './run';
import { RunArgs } from './RunArgs';
import { ImageEffectResult } from './types';

export async function runEffectRPC(args: RunArgs): Promise<ImageEffectResult> {
  logger.info('Received message from main thread:', args);
  return await runEffects(args);
}
