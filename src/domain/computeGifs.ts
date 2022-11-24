import { readImage, runEffects } from './run';
import { runEffectsAsync } from './runAsync';
import { AppState, ComputeState, Image, ImageEffectResult } from './types';
import { ENV, debugLog, IS_MOBILE } from './env';
import { assert } from './utils/misc';

// OffscreenCanvas isn't supported by mobile browsers, so mobile will also run synchronously,
//  which will force us to use regular canvas and not OffscreenCanvas.
// Also, we can't get web workers working with the dev build, so awalsy use the synchrounous
//  version if not a prod build.
export const computeGif =
  IS_MOBILE || ENV === 'DEV' ? runEffects : runEffectsAsync;

export const computeGifsForState = async ({
  appState,
  computeState,
  startEffectIndex,
  onCompute,
}: {
  appState: AppState;
  computeState: ComputeState[];
  startEffectIndex: number;
  onCompute: (image: ImageEffectResult, idx: number) => void;
}): Promise<void> => {
  if (!appState.baseImage) {
    return;
  }
  // assert(
  //   appState.baseImage,
  //   'No source image, this button should be disabled!'
  // );

  let image: Image;
  if (startEffectIndex === 0) {
    image = await readImage(appState.baseImage);
  } else {
    const prevEffectState = computeState[startEffectIndex - 1];
    assert(
      prevEffectState?.status === 'done',
      'We should not be starting with this effect if the previous is not done computing'
    );
    image = prevEffectState.image.image;
  }

  for (let i = startEffectIndex; i < appState.effects.length; i += 1) {
    const start = Date.now();

    const effect = appState.effects[i];

    const result = await computeGif({
      randomSeed: appState.baseImage,
      image,
      effectInput: {
        effectName: effect.effectName,
        params: effect.paramsValues,
      },
      fps: appState.fps,
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

export type EffectsDiff = { diff: true; index: number } | { diff: false };

/** Get the index of the first effect that differs from curr to prev state */
export const getEffectsDiff = ({
  currState,
  prevState,
  computeState,
}: {
  currState: AppState;
  prevState: AppState;
  computeState: ComputeState[];
}): EffectsDiff => {
  if (currState.effects.length === 0) {
    return { diff: false };
  }

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
    const currEffect = currEffects[i];
    const prevEffect = prevEffects[i];
    const compute = computeState[i];
    if (compute == null) {
      debugLog('No prevE, index ', i);
      return { diff: true, index: i };
    }

    if (compute.status !== 'done') {
      debugLog('PrevE not done ', i);
      return { diff: true, index: i };
    }

    if (currEffect.effectName !== prevEffect.effectName) {
      debugLog('Different effect name ', i);
      return { diff: true, index: i };
    }

    // Compare the param values
    for (let ei = 0; ei < currEffect.paramsValues.length; ei += 1) {
      const currEParam = currEffect.paramsValues[ei];
      const prevEP = prevEffect.paramsValues[ei];
      if (JSON.stringify(currEParam) !== JSON.stringify(prevEP)) {
        debugLog('Param different', i, ei);
        return { diff: true, index: i };
      }
    }
  }

  debugLog('No diff');
  return { diff: false };
};
