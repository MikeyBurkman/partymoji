import { beforeEach, expect, it, vi } from 'vitest';
import { computeGifsForState, getStateDiff } from '~/domain/computeGifs';
import { runEffects } from '~/domain/run';
import type {
  AppState,
  AppStateEffect,
  ImageEffectResult,
} from '~/domain/types';

// Keep the real chain orchestration; control the expensive effect/encoder boundary.
vi.mock('~/domain/run', () => ({ runEffects: vi.fn() }));

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

beforeEach(() => vi.mocked(runEffects).mockReset().mockResolvedValue(source));

function completedRepeatedEffects(): AppState {
  return {
    ...state,
    effects: Array.from(
      { length: 3 },
      (): AppStateEffect => ({
        effectName: 'first',
        paramsValues: [],
        state: { status: 'done', image: source },
      }),
    ),
  };
}

it.each([0, 1])(
  'recomputes an identical effect inserted at index %i and every dependent effect',
  async (index) => {
    const prevState = completedRepeatedEffects();
    const inserted: AppStateEffect = {
      effectName: 'first',
      paramsValues: [],
      state: { status: 'init' },
    };
    const currState = {
      ...prevState,
      effects: [
        ...prevState.effects.slice(0, index),
        inserted,
        ...prevState.effects.slice(index),
      ],
    };
    const diff = getStateDiff({ currState, prevState });
    expect(diff).toEqual({ changed: true, index });
    if (!diff.changed) throw new Error('Insertion must trigger computation');
    const result = await computeGifsForState({
      state: currState,
      startEffectIndex: diff.index,
    });
    expect(runEffects).toHaveBeenCalledTimes(4 - index);
    expect(result.effects.map((effect) => effect.state.status)).toEqual([
      'done',
      'done',
      'done',
      'done',
    ]);
    if (index > 0) expect(result.effects[0]).toBe(prevState.effects[0]);
  },
);

it.each([0, 1, 2])(
  'invalidates displaced identical cached effects when removing index %i',
  (index) => {
    const prevState = completedRepeatedEffects();
    const currState = {
      ...prevState,
      effects: prevState.effects.filter((_, i) => i !== index),
    };
    expect(getStateDiff({ currState, prevState })).toEqual({
      changed: true,
      index,
    });
  },
);

it('retains a completed prefix when rows are copied without changing their cached results', () => {
  const prevState = completedRepeatedEffects();
  const currState = {
    ...prevState,
    effects: prevState.effects.map((effect) => ({ ...effect })),
  };
  expect(getStateDiff({ currState, prevState })).toEqual({ changed: false });
});

it('does not start any effect when already canceled', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(
    computeGifsForState({
      state,
      startEffectIndex: 0,
      signal: controller.signal,
    }),
  ).rejects.toMatchObject({ name: 'AbortError' });
  expect(runEffects).not.toHaveBeenCalled();
});

it('stops at the current effect boundary instead of computing the rest of an obsolete chain', async () => {
  const controller = new AbortController();
  let finish!: (result: ImageEffectResult) => void;
  vi.mocked(runEffects).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = computeGifsForState({
    state,
    startEffectIndex: 0,
    signal: controller.signal,
  });
  const rejected = expect(pending).rejects.toMatchObject({
    name: 'AbortError',
  });
  controller.abort();
  finish(source);
  await rejected;
  expect(runEffects).toHaveBeenCalledTimes(1);
});

it('still feeds each completed effect into the next and retains a cached prefix', async () => {
  const intermediate = {
    ...source,
    gif: 'intermediate',
    image: { ...source.image, frames: [new Uint8ClampedArray([4, 5, 6, 255])] },
  };
  vi.mocked(runEffects)
    .mockResolvedValueOnce(intermediate)
    .mockResolvedValueOnce(source);
  const cached = {
    ...state.effects[0],
    state: { status: 'done' as const, image: source },
  };
  const result = await computeGifsForState({
    state: { ...state, effects: [cached, ...state.effects.slice(1)] },
    startEffectIndex: 1,
    signal: new AbortController().signal,
  });
  expect(runEffects).toHaveBeenCalledTimes(2);
  expect(
    vi
      .mocked(runEffects)
      .mock.calls.map(([args]) => [
        args.effectInput.effectName,
        args.image,
        args.fps,
      ]),
  ).toEqual([
    ['second', source.image, 20],
    ['third', intermediate.image, 20],
  ]);
  expect(result.effects[0]).toBe(cached);
  expect(result.effects.map((effect) => effect.state)).toEqual([
    cached.state,
    { status: 'done', image: intermediate },
    { status: 'done', image: source },
  ]);
});
