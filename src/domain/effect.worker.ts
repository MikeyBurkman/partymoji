import { logger } from './logger';
import { runEffects } from './run';
import { RunArgs } from './RunArgs';
import { AsyncRunMessage } from './types';

const ctx: Worker = self as unknown as Worker;

ctx.addEventListener('message', (event: MessageEvent<RunArgs>) => {
  void (async () => {
    try {
      logger.info('Received message from main thread:', event.data);
      const result = await runEffects(event.data);

      const message: AsyncRunMessage = {
        status: 'complete',
        result,
      };

      logger.info('Sending message to main thread:', message);
      ctx.postMessage(message);
    } catch (error) {
      logger.error('Error in worker:', error);
      const message: AsyncRunMessage = {
        status: 'error',
        error,
      };

      logger.info('Sending error message to main thread:', message);
      ctx.postMessage(message);
    }
  })();
});
