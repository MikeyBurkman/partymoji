import seedrandom from 'seedrandom';
import { effectByName } from '~/effects';
import { Image, ImageEffectResult } from './types';
import { imageUtil, logger } from '~/domain/utils';
import { fakeTransparency } from '~/effects/fake-transparency';
import { RunArgs } from './RunArgs';
import { wasmCreateGif } from './wasmGifEncoder';

// Returns a list of gif data URLs, for each effect
export const runEffects = async ({
  image,
  effectInput,
  randomSeed,
  fps,
}: RunArgs): Promise<ImageEffectResult> => {
  const random = seedrandom(randomSeed);

  logger.info('Running effect', {
    name: effectInput.effectName,
    params: effectInput.params,
  });

  const effect = effectByName(effectInput.effectName);
  const result = await effect.fn({
    image,
    parameters: effectInput.params,
    random,
  });

  const gif = await createGif({
    // Transform any of our transparent pixels to what our gif understands to be transparent
    image: result,
    fps,
  });

  const resultWithBG = await fakeTransparency.fn({
    image: result,
    parameters: [],
    random,
  });

  return {
    gif,
    image: result,
    partiallyTransparent: imageUtil.isPartiallyTransparent(result),
    gifWithBackgroundColor: await createGif({
      image: resultWithBG,
      fps,
    }),
  };
};

const createGif = async ({
  image,
  fps,
}: {
  image: Image;
  fps: number;
}): Promise<string> => {
  logger.debug('Creating GIF', {
    dimensions: image.dimensions,
    numberOfFrames: image.frames.length,
    fps,
  });

  return wasmCreateGif({
    image,
    fps,
  });
};
