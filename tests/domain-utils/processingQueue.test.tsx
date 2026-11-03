import { flushReact } from './reactAct';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { useProcessingQueue } from '~/components/useProcessingQueue';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await flushReact(() => {
    root.unmount();
  });
  host.remove();
});

async function mount(
  processFn: (args: number, signal: AbortSignal) => number | Promise<number>,
) {
  let compute!: ReturnType<typeof useProcessingQueue<number, number>>;
  const results: Array<number> = [];
  const errors: Array<Error> = [];
  function Harness() {
    compute = useProcessingQueue({
      processFn,
      onComplete: (result) => results.push(result),
      onError: (error) => errors.push(error),
    });
    return null;
  }
  await flushReact(() => {
    root.render(<Harness />);
  });
  return { compute, results, errors };
}

it('runs only the newest waiting request and never overlaps computations', async () => {
  const first = deferred<number>();
  const last = deferred<number>();
  const started: Array<number> = [];
  const signals: Array<AbortSignal> = [];
  const { compute, results } = await mount((value, signal) => {
    started.push(value);
    signals.push(signal);
    return value === 1 ? first.promise : last.promise;
  });
  compute(1);
  compute(2);
  compute(3);
  expect(started).toEqual([1]);
  expect(signals[0].aborted).toBe(true);
  await flushReact(() => {
    first.resolve(10);
  });
  expect(started).toEqual([1, 3]);
  expect(results).toEqual([]);
  expect(signals[1].aborted).toBe(false);
  await flushReact(() => {
    last.resolve(30);
  });
  expect(results).toEqual([30]);
});

it('ignores obsolete errors and starts the newest request after a rejection', async () => {
  const first = deferred<number>();
  const { compute, results, errors } = await mount((value) =>
    value === 1 ? first.promise : value,
  );
  compute(1);
  compute(2);
  await flushReact(() => {
    first.reject(new Error('obsolete failure'));
  });
  expect(errors).toEqual([]);
  expect(results).toEqual([2]);
});

it('reports a current error and remains usable after a synchronous throw', async () => {
  const { compute, results, errors } = await mount((value) => {
    if (value === 1) throw new Error('current failure');
    return value;
  });
  await flushReact(() => {
    compute(1);
  });
  expect(errors.map((error) => error.message)).toEqual(['current failure']);
  await flushReact(() => {
    compute(2);
  });
  expect(results).toEqual([2]);
});

it.each(['cancel', 'unmount'] as const)(
  '%s aborts active work and drops the waiting request',
  async (action) => {
    const first = deferred<number>();
    const started: Array<number> = [];
    let signal!: AbortSignal;
    const { compute, results, errors } = await mount((value, currentSignal) => {
      started.push(value);
      signal = currentSignal;
      return first.promise;
    });
    compute(1);
    compute(2);
    await flushReact(() => {
      if (action === 'cancel') compute.cancel();
      else root.render(null);
    });
    expect(signal.aborted).toBe(true);
    await flushReact(() => {
      first.resolve(10);
    });
    expect(started).toEqual([1]);
    expect(results).toEqual([]);
    expect(errors).toEqual([]);
  },
);

it('accepts a new request after cancellation without overlapping the old one', async () => {
  const first = deferred<number>();
  const started: Array<number> = [];
  const { compute, results } = await mount((value) => {
    started.push(value);
    return value === 1 ? first.promise : value;
  });
  compute(1);
  compute.cancel();
  compute(2);
  expect(started).toEqual([1]);
  await flushReact(() => {
    first.resolve(10);
  });
  expect(started).toEqual([1, 2]);
  expect(results).toEqual([2]);
});

it('ignores delayed calls after unmount', async () => {
  const started: Array<number> = [];
  const { compute, results } = await mount((value) => {
    started.push(value);
    return value;
  });
  await flushReact(() => {
    root.render(null);
  });
  await flushReact(() => {
    compute(1);
  });
  expect(started).toEqual([]);
  expect(results).toEqual([]);
});
