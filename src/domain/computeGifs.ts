import { runEffects } from './run';
import { runEffectsAsync } from './runAsync';
import { AppState, AppStateEffect, Image } from './types';
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
}: {
  state: AppState;
  startEffectIndex: number;
}): Promise<AppState> => {
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

  const images: Array<AppStateEffect> = [];

  for (let i = 0; i < state.effects.length; i += 1) {
    if (i < startEffectIndex) {
      // Skip effects that have already been computed
      images.push(state.effects[i]);
      continue;
    }

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

  logger.debug('No diff');
  return { changed: false };
};
