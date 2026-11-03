import React from 'react';

interface InitProps<TArgs, TRet> {
  processFn: (args: TArgs, signal: AbortSignal) => TRet | Promise<TRet>;
  onComplete: (ret: TRet) => void;
  onError?: (err: Error) => void;
}

type ComputeFn<TArgs> = ((args: TArgs) => void) & { cancel: () => void };

/**
 * Runs one computation at a time, keeping only the newest waiting request.
 * Superseded work receives an abort signal and cannot publish results or errors.
 * The processor must check the signal at safe boundaries to stop work early.
 */
export function useProcessingQueue<TArgs, TRet>({
  processFn,
  onComplete,
  onError,
}: InitProps<TArgs, TRet>): ComputeFn<TArgs> {
  const queueRef = React.useRef<{
    active: AbortController | null;
    pending: (() => Promise<void>) | null;
  }>({ active: null, pending: null });
  const mountedRef = React.useRef(true);

  const cancel = React.useCallback(() => {
    queueRef.current.pending = null;
    queueRef.current.active?.abort();
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancel();
    };
  }, [cancel]);

  const compute = React.useCallback(
    (args: TArgs): void => {
      if (!mountedRef.current) return;
      const queue = queueRef.current;
      const run = async () => {
        const controller = new AbortController();
        queue.active = controller;
        try {
          const result = await processFn(args, controller.signal);
          if (!controller.signal.aborted) onComplete(result);
        } catch (error) {
          if (!controller.signal.aborted) {
            onError?.(
              error instanceof Error ? error : new Error(String(error)),
            );
          }
        } finally {
          queue.active = null;
          const next = queue.pending;
          queue.pending = null;
          if (next) void next();
        }
      };

      if (queue.active) {
        queue.pending = run;
        queue.active.abort();
      } else {
        void run();
      }
    },
    [processFn, onError, onComplete],
  );

  return React.useMemo(
    () => Object.assign(compute, { cancel }),
    [compute, cancel],
  );
}
