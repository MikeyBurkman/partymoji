import { readImage, runEffects } from './run';
import { runEffectsAsync } from './runAsync';
import { AppState, EffectInput, Image, ImageEffectResult } from './types';
import { ENV, debugLog } from './env';
import { assert } from './utils';

// Can't get web workers working with the dev build, so just use the synchrounous version
//  if not a prod build.
const run = ENV === 'DEV' ? runEffects : runEffectsAsync;

export const applyEffect = ({
  state,
  image,
  effect,
}: {
  state: AppState;
  image: Image;
  effect: EffectInput;
}) =>
  run({
    randomSeed: state.baseImage!,
    image,
    effectInput: effect,
    fps: state.fps,
  });

export const computeGifs = async ({
  state,
  startEffectIndex,
  onCompute,
}: {
  state: AppState;
  startEffectIndex: number;
  onCompute: (image: ImageEffectResult, idx: number) => void;
}): Promise<void> => {
  assert(state.baseImage, 'No source image, this button should be disabled!');

  let image: Image;
  if (startEffectIndex === 0) {
    image = await readImage(state.baseImage);
  } else {
    const prevEffectState = state.effects[startEffectIndex - 1].state;
    assert(
      prevEffectState.status === 'done',
      'We should not be starting with this effect if the previous is not done computing'
    );
    image = prevEffectState.image.image;
  }

  for (let i = startEffectIndex; i < state.effects.length; i += 1) {
    const start = Date.now();

    const effect = state.effects[i];

    const result = await applyEffect({
      state,
      image,
      effect: {
        effectName: effect.effectName,
        params: effect.paramsValues,
      },
    });

    // Google analytics
    ga('send', {
      hitType: 'timing',
      timingCategory: 'computeStep',
      timingVar: effect.effectName,
      timingValue: Math.ceil((Date.now() - start) / 1000),
    });

    image = result.image;

    onCompute(result, i);
  }
};

/** Get the index of the first effect that differs from curr to prev state */
export const getEffectsDiff = ({
  currState,
  prevState,
}: {
  currState: AppState;
  prevState: AppState;
}): { diff: true; index: number } | { diff: false } => {
  if (
    currState.fps !== prevState.fps ||
    currState.baseImage !== prevState.baseImage
  ) {
    debugLog('FPS or base image is different');
    return { diff: true, index: 0 };
  }

  const currEffects = currState.effects;
  const prevEffects = prevState.effects;

  // Find the first newEffect that is different from prevEffects
  for (let i = 0; i < currEffects.length; i += 1) {
    const currE = currEffects[i];
    const prevE = prevEffects[i];
    if (!prevE) {
      debugLog('No prevE, index ', i);
      return { diff: true, index: i };
    }

    if (prevE.state.status !== 'done') {
      debugLog('PrevE not done ', i);
      return { diff: true, index: i };
    }

    if (currE.effectName !== prevE.effectName) {
      debugLog('Different effect name ', i);
      return { diff: true, index: i };
    }

    // Compare the param values
    for (let ei = 0; ei < currE.paramsValues.length; ei += 1) {
      const currEParam = currE.paramsValues[ei];
      const prevEP = prevE.paramsValues[ei];
      if (JSON.stringify(currEParam) !== JSON.stringify(prevEP)) {
        debugLog('Param different', i, ei);
        return { diff: true, index: i };
      }
    }
  }

  debugLog('No diff');
  return { diff: false };
};
