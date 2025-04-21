import seedrandom from 'seedrandom';
import { effectByName } from '~/effects';
import { Color, Image, ImageEffectResult } from './types';
import { colorUtil, imageUtil, logger } from '~/domain/utils';
import { fakeTransparency } from '~/effects/fake-transparency';
import { RunArgs } from './RunArgs';
import { wasmCreateGif } from './wasmGifEncoder';

// Returns a list of gif data URLs, for each effect
export const runEffects = async ({
  image,
  effectInput,
  randomSeed,
  fps,
  useAlternateGifGenerator,
}: RunArgs): Promise<ImageEffectResult> => {
  const random = seedrandom(randomSeed);

  logger.info(
    'Running effect, name:',
    effectInput.effectName,
    'params:',
    effectInput.params,
    'useAlternateGifGenerator:',
    useAlternateGifGenerator,
  );

  const effect = effectByName(effectInput.effectName);
  const result = await effect.fn({
    image,
    parameters: effectInput.params,
    random,
  });

  const { transparentColor, hasPartialTransparency } = getTransparentColor(
    result,
    random,
  );

  const startTime = performance.now();

  const gif = await createGif({
    // Transform any of our transparent pixels to what our gif understands to be transparent
    image: encodeTransparency(result, transparentColor),
    transparentColor,
    fps,
    useAlternateGifGenerator,
  });

  const endTime = performance.now();
  console.log(`GIF creation took ${endTime - startTime} milliseconds.`);

  if (hasPartialTransparency) {
    const resultWithBG = await fakeTransparency.fn({
      image: result,
      parameters: [],
      random,
    });

    return {
      gif,
      image: result,
      partiallyTransparent: true,
      gifWithBackgroundColor: await createGif({
        image: resultWithBG,
        transparentColor: undefined,
        fps,
        useAlternateGifGenerator,
      }),
    };
  } else {
    const resultWithBG =
      transparentColor == null
        ? undefined
        : await fakeTransparency.fn({
            image: result,
            parameters: [],
            random,
          });

    return {
      gif,
      image: result,
      partiallyTransparent: false,
      gifWithBackgroundColor:
        resultWithBG == null
          ? null
          : await createGif({
              image: resultWithBG,
              transparentColor: undefined,
              fps,
              useAlternateGifGenerator,
            }),
    };
  }
};

/**
 * Each pixel in our image has an alpha channel, but gifs don't.
 * We transform each pixel that appears transparent to be a designated transparent color.
 */
const encodeTransparency = (
  image: Image,
  transparentColor: Color | undefined,
): Image => {
  if (!transparentColor) {
    return image;
  }
  const newFrames = image.frames.map((frame) => {
    const img = new Uint8ClampedArray(frame.length);
    for (let i = 0; i < frame.length; i += 4) {
      if (frame[i + 3] < 128) {
        // Anything more than halfway transparent is considered transparent
        img[i] = transparentColor[0];
        img[i + 1] = transparentColor[1];
        img[i + 2] = transparentColor[2];
        img[i + 3] = 0;
      } else {
        img[i] = frame[i];
        img[i + 1] = frame[i + 1];
        img[i + 2] = frame[i + 2];
        img[i + 3] = 0; // Gifs don't do transparency, I dunno why they take in an alpha value...
      }
    }
    return img;
  });

  return {
    dimensions: image.dimensions,
    frames: newFrames,
  };
};

const createGif = async ({
  image,
  transparentColor,
  fps,
  useAlternateGifGenerator,
}: {
  image: Image;
  transparentColor: Color | undefined;
  fps: number;
  useAlternateGifGenerator: boolean;
}): Promise<string> => {
  logger.debug(
    'Creating GIF with dimensions:',
    image.dimensions,
    'fps:',
    fps,
    'useAlternateGifGenerator:',
    useAlternateGifGenerator,
  );

  return wasmCreateGif({
    image,
    transparentColor,
    fps,
    useAlternateGifGenerator,
  });
};

const getTransparentColor = (
  image: Image,
  random: seedrandom.PRNG,
):
  | {
      hasPartialTransparency: true;
      transparentColor: Color;
    }
  | {
      hasPartialTransparency: false;
      transparentColor: Color | undefined;
    } => {
  let hasTransparent = false;
  const seenPixels = new Set<string>();
  const [width, height] = image.dimensions;
  let hasPartialTransparency = false;
  let attempt = colorUtil.toHexColor([0, 255, 0, 255]); // Just start with green for now, since it's a likely candidate
  image.frames.forEach((frame) => {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const px = imageUtil.getPixelFromSource(image.dimensions, frame, [
          x,
          y,
        ]);
        if (colorUtil.isPartiallyTransparent(px)) {
          hasPartialTransparency = true;
        }
        if (colorUtil.isTransparent(px)) {
          hasTransparent = true;
        } else {
          const hex = colorUtil.toHexColor(px);
          seenPixels.add(hex);
          if (hex === attempt) {
            // Uh oh, can't use our current pick for transparent because it exists in the image already
            attempt = findRandomColorNotInSet(random, seenPixels);
          }
        }
      }
    }
  });
  return {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- MIKE - hasTransparent is always falsy!!
    transparentColor: hasTransparent
      ? colorUtil.fromHexColor(attempt)
      : undefined,
    hasPartialTransparency,
  };
};

const findRandomColorNotInSet = (
  random: seedrandom.PRNG,
  set: Set<string>,
  attempts = 0,
): string => {
  const col = colorUtil.toHexColor(colorUtil.randomColor(random));
  if (attempts > 2000) {
    // Just give up in order to prevent a stack overflow or something...
    return col;
  }
  return set.has(col)
    ? findRandomColorNotInSet(random, set, attempts + 1)
    : col;
};
