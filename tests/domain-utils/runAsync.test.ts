import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { endpointSymbol } from 'vite-plugin-comlink/symbol';
import { runEffectsAsync } from '~/domain/runAsync';
import type { RunArgs } from '~/domain/RunArgs';
import type { ImageEffectResult } from '~/domain/types';

const args: RunArgs = {
  randomSeed: 'test',
  image: { dimensions: [1, 1], frames: [new Uint8ClampedArray(4)] },
  effectInput: { effectName: 'test', params: [] },
  fps: 20,
};
const result: ImageEffectResult = {
  image: args.image,
  gif: 'test-gif',
  partiallyTransparent: false,
  gifWithBackgroundColor: null,
};

class FakeWorker extends EventTarget {
  terminated = false;
  calls: Array<{
    args: RunArgs;
    resolve: (result: ImageEffectResult) => void;
    reject: (error: Error) => void;
  }> = [];
  terminate() {
    this.terminated = true;
  }
}

let workers: Array<FakeWorker>;
beforeEach(() => {
  workers = [];
  vi.stubGlobal(
    'ComlinkWorker',
    class {
      [endpointSymbol]: FakeWorker;
      constructor() {
        this[endpointSymbol] = new FakeWorker();
        workers.push(this[endpointSymbol]);
      }
      runEffectRPC(args: RunArgs) {
        return new Promise<ImageEffectResult>((resolve, reject) => {
          this[endpointSymbol].calls.push({ args, resolve, reject });
        });
      }
    },
  );
});
afterEach(() => {
  window.dispatchEvent(new Event('pagehide'));
  vi.unstubAllGlobals();
});

it('reuses the worker across sequential effects', async () => {
  const first = runEffectsAsync(args);
  workers[0].calls[0].resolve(result);
  expect(await first).toEqual(result);
  const second = runEffectsAsync(args);
  expect(workers).toHaveLength(1);
  expect(workers[0].calls[1].args).toEqual(args);
  workers[0].calls[1].resolve(result);
  expect(await second).toEqual(result);
});

it('routes overlapping results correctly when they finish out of order', async () => {
  const first = runEffectsAsync(args);
  const second = runEffectsAsync({ ...args, fps: 30 });
  expect(workers).toHaveLength(1);
  const other = { ...result, gif: 'other-gif' };
  workers[0].calls[1].resolve(other);
  workers[0].calls[0].resolve(result);
  expect(await second).toEqual(other);
  expect(await first).toEqual(result);
});

it('keeps the worker usable after an individual effect rejects', async () => {
  const first = runEffectsAsync(args);
  workers[0].calls[0].reject(new Error('effect failed'));
  await expect(first).rejects.toThrow('effect failed');
  const second = runEffectsAsync(args);
  expect(workers).toHaveLength(1);
  workers[0].calls[1].resolve(result);
  expect(await second).toEqual(result);
});

it.each([
  ['error', 'worker crashed'],
  ['messageerror', 'Unable to deserialize effect worker message'],
])(
  'rejects pending work on %s and creates a replacement',
  async (type, message) => {
    const first = runEffectsAsync(args);
    const second = runEffectsAsync(args);
    const failures = Promise.all([
      expect(first).rejects.toThrow(message),
      expect(second).rejects.toThrow(message),
    ]);
    workers[0].dispatchEvent(
      new ErrorEvent(type, { message: 'worker crashed' }),
    );
    await failures;
    expect(workers[0].terminated).toBe(true);
    const next = runEffectsAsync(args);
    expect(workers).toHaveLength(2);
    workers[1].calls[0].resolve(result);
    expect(await next).toEqual(result);
  },
);

it('terminates the worker on pagehide and can restart after returning to the page', async () => {
  const pending = runEffectsAsync(args);
  const failure = expect(pending).rejects.toThrow('Effect worker stopped');
  window.dispatchEvent(new Event('pagehide'));
  await failure;
  expect(workers[0].terminated).toBe(true);
  const next = runEffectsAsync(args);
  expect(workers).toHaveLength(2);
  workers[1].calls[0].resolve(result);
  expect(await next).toEqual(result);
});
