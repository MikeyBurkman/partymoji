import { runEffects } from './run';
import { runEffectsAsync } from './runAsync';
import { AppState, Image, ImageEffectResult } from './types';
import { IS_DEV, debugLog, IS_MOBILE } from './env';
import { miscUtil } from './utils';

// OffscreenCanvas isn't supported by mobile browsers, so mobile will also run synchronously,
//  which will force us to use regular canvas and not OffscreenCanvas.
// Also, we can't get web workers working with the dev build, so always use the synchronous
//  version if not a prod build.
export const computeGif =
  IS_MOBILE || IS_DEV ? runEffects : runEffectsAsync;

export const computeGifsForState = async ({
  state,
  startEffectIndex,
  onCompute,
}: {
  state: AppState;
  startEffectIndex: number;
  onCompute: (image: ImageEffectResult, idx: number) => void;
}): Promise<void> => {
  miscUtil.assert(
    state.baseImage,
    'No source image, this button should be disabled!',
  );

  let image: Image;
  if (startEffectIndex === 0) {
    image = state.baseImage.image;
  } else {
    const prevEffectState = state.effects[startEffectIndex - 1].state;
    miscUtil.assert(
      prevEffectState.status === 'done',
      'We should not be starting with this effect if the previous is not done computing',
    );
    image = prevEffectState.image.image;
  }

  for (let i = startEffectIndex; i < state.effects.length; i += 1) {
    const effect = state.effects[i];

    const result = await computeGif({
      randomSeed: state.baseImage.gif,
      image,
      effectInput: {
        effectName: effect.effectName,
        params: effect.paramsValues,
      },
      fps: state.fps,
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
