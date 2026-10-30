import { runEffects } from './run';
import { runEffectsAsync } from './runAsync';
import { AppState, AppStateEffect, Image, ImageEffectResult } from './types';
import { IS_MOBILE } from './utils/isMobile';
import { miscUtil, logger, IS_DEV } from './utils';

// OffscreenCanvas isn't supported by mobile browsers, so mobile will also run synchronously,
//  which will force us to use regular canvas and not OffscreenCanvas.
// Also, we can't get web workers working with the dev build, so always use the synchronous
//  version if not a prod build.
export const computeGif = IS_MOBILE || IS_DEV ? runEffects : runEffectsAsync;

export const computeGifsForState = async ({
  state,
  startEffectIndex,
  previousState,
}: {
  state: AppState;
  startEffectIndex: number;
  previousState?: AppState;
}): Promise<AppState> => {
  miscUtil.assert(
    state.baseImage,
    'No source image, this button should be disabled!',
  );

  let previousResult: ImageEffectResult;
  if (startEffectIndex === 0) {
    previousResult = state.baseImage;
  } else {
    const prevEffectState = state.effects[startEffectIndex - 1].state;
    miscUtil.assert(
      prevEffectState.status === 'done',
      'We should not be starting with this effect if the previous is not done computing',
      { startEffectIndex, prevEffectState },
    );
    previousResult = prevEffectState.image;
  }

  const images: Array<AppStateEffect> = [];
  const previousInputs = new Map<AppStateEffect, Image>();
  if (
    previousState?.baseImage &&
    previousState.fps === state.fps &&
    previousState.frameCount === state.frameCount &&
    previousState.baseImage.gif === state.baseImage.gif
  ) {
    let input = previousState.baseImage.image;
    for (const effect of previousState.effects) {
      if (effect.state.status !== 'done') {
        break;
      }
      previousInputs.set(effect, input);
      input = effect.state.image.image;
    }
  }

  for (let i = 0; i < state.effects.length; i += 1) {
    if (i < startEffectIndex) {
      // Skip effects that have already been computed
      images.push(state.effects[i]);
      continue;
    }

    const effect = state.effects[i];

    // Inserting/removing an empty entry preserves the input of existing effects.
    if (
      effect.state.status === 'done' &&
      previousInputs.get(effect) === previousResult.image
    ) {
      previousResult = effect.state.image;
      images.push(effect);
      continue;
    }

    // A placeholder reuses the complete result, avoiding rendering and GIF encoding.
    const result =
      effect.effectName === null
        ? previousResult
        : await computeGif({
            randomSeed: state.baseImage.gif,
            image: previousResult.image,
            effectInput: {
              effectName: effect.effectName,
              params: effect.paramsValues,
            },
            fps: state.fps,
          });

    previousResult = result;
    images.push({
      effectName: effect.effectName,
      state: {
        status: 'done',
        image: result,
      },
      paramsValues: effect.paramsValues,
    });
  }

  return {
    ...state,
    effects: images,
  };
};

/** Get the index of the first effect that differs from curr to prev state */
export const getStateDiff = ({
  currState,
  prevState,
}: {
  currState: AppState;
  prevState: AppState;
}): { changed: true; index: number } | { changed: false } => {
  if (
    currState.fps !== prevState.fps ||
    currState.baseImage !== prevState.baseImage ||
    currState.frameCount !== prevState.frameCount
  ) {
    logger.debug('FPS, base image or frameCount is different');
    return { changed: true, index: 0 };
  }

  const currEffects = currState.effects;
  const prevEffects = prevState.effects;

  // Find the first newEffect that is different from prevEffects
  for (let i = 0; i < currEffects.length; i += 1) {
    const currE = currEffects[i];
    const prevE = prevEffects[i];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- invalid linting error
    if (!prevE) {
      logger.debug('No prevE, index ', i);
      return { changed: true, index: i };
    }

    if (prevE.state.status !== 'done') {
      logger.debug('PrevE not done ', i);
      return { changed: true, index: i };
    }

    if (currE.effectName !== prevE.effectName) {
      logger.debug('Different effect name ', i);
      return { changed: true, index: i };
    }

    // Compare the param values
    for (let ei = 0; ei < currE.paramsValues.length; ei += 1) {
      const currEParam: unknown = currE.paramsValues[ei];
      const prevEP: unknown = prevE.paramsValues[ei];
      if (JSON.stringify(currEParam) !== JSON.stringify(prevEP)) {
        logger.debug('Param different', i, ei);
        return { changed: true, index: i };
      }
    }
  }

  if (currEffects.length < prevEffects.length) {
    // Could happen if an effect at the end was removed
    logger.debug('Current effects length is less than previous effects length');
    return { changed: true, index: currEffects.length };
  }

  logger.debug('No diff');
  return { changed: false };
};
