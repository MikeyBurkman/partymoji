import { flushReact } from './reactAct';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  AppStateContext,
  AppStateProvider,
  type AppStateContextProps,
} from '~/context/stateContext';
import { runEffects } from '~/domain/run';
import type { AppState, ImageEffectResult } from '~/domain/types';
import * as storage from '~/domain/storage';

vi.mock('~/domain/run', () => ({ runEffects: vi.fn() }));
vi.mock('~/domain/storage', () => ({
  getStoredAppState: vi.fn(),
  saveAppState: vi.fn().mockResolvedValue(undefined),
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const source: ImageEffectResult = {
  image: {
    dimensions: [1, 1],
    frames: [new Uint8ClampedArray([1, 2, 3, 255])],
  },
  gif: 'source',
  partiallyTransparent: false,
  gifWithBackgroundColor: null,
};
const state: AppState = {
  version: 9,
  baseImage: source,
  fps: 20,
  frameCount: 1,
  effects: ['first', 'second', 'third'].map((effectName) => ({
    effectName,
    paramsValues: [],
    state: { status: 'init' },
  })),
};
let root: Root;
let host: HTMLDivElement;
let context: AppStateContextProps;
let finish: (result: ImageEffectResult) => void;

function Harness() {
  context = React.use(AppStateContext);
  return null;
}

beforeEach(async () => {
  vi.useFakeTimers();
  vi.mocked(storage.getStoredAppState).mockResolvedValue({
    ...state,
    effects: [],
  });
  vi.mocked(runEffects).mockReset().mockResolvedValue(source);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await flushReact(() => {
    root.render(
      <AppStateProvider>
        <Harness />
      </AppStateProvider>,
    );
  });
  vi.mocked(runEffects).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
});
afterEach(async () => {
  await flushReact(() => {
    root.unmount();
  });
  host.remove();
  vi.useRealTimers();
});

async function request(fps: number, debounce?: 'debounce') {
  await flushReact(() => {
    context.setState(() => ({ ...state, fps }), debounce);
    if (!debounce) vi.runOnlyPendingTimers();
  });
}

it('passes cancellation into the effect chain and publishes only the newest state', async () => {
  await request(20);
  await request(30);
  await request(40);
  expect(runEffects).toHaveBeenCalledTimes(1);
  await flushReact(() => {
    finish(source);
  });
  expect(
    vi
      .mocked(runEffects)
      .mock.calls.map(([args]) => [args.effectInput.effectName, args.fps]),
  ).toEqual([
    ['first', 20],
    ['first', 40],
    ['second', 40],
    ['third', 40],
  ]);
  expect(context.state.fps).toBe(40);
  expect(context.state.effects.map((effect) => effect.state.status)).toEqual([
    'done',
    'done',
    'done',
  ]);
});

it('reset discards the active result, queued request, and pending debounce', async () => {
  await request(20);
  await request(30);
  await request(40, 'debounce');
  await flushReact(() => {
    context.resetState();
  });
  await flushReact(() => {
    finish(source);
    vi.runOnlyPendingTimers();
  });
  expect(runEffects).toHaveBeenCalledTimes(1);
  expect(context.state.baseImage).toBeUndefined();
  expect(context.state.effects).toEqual([]);
});
