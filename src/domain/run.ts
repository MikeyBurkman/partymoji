import GIFEncoder from 'gif-encoder';
import seedrandom from 'seedrandom';
import { effectByName } from '~/effects';
import { Color, Image, ImageEffectResult } from './types';
import { colorUtil, imageUtil, miscUtil } from '~/domain/utils';
import { fakeTransparency } from '~/effects/fake-transparency';
import { RunArgs } from './RunArgs';

// Returns a list of gif data URLs, for each effect
export const runEffects = async ({
  image,
  effectInput,
  randomSeed,
  fps,
}: RunArgs): Promise<ImageEffectResult> => {
  const random = seedrandom(randomSeed);

  const effect = effectByName(effectInput.effectName);
  const result = await effect.fn({
    image,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    parameters: effectInput.params,
    random,
  });

  const { transparentColor, hasPartialTransparency } = getTransparentColor(
    result,
    random,
  );

  const gif = await createGif({
    // Transform any of our transparent pixels to what our gif understands to be transparent
    image: encodeTransparency(result, transparentColor),
    transparentColor,
    fps,
  });

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
          ? undefined
          : await createGif({
              image: resultWithBG,
              transparentColor: undefined,
              fps,
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
  const newFrames = image.frames.map((frame) => {
    const img = new Uint8ClampedArray(frame.length);
    for (let i = 0; i < frame.length; i += 4) {
      if (transparentColor && frame[i + 3] < 128) {
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
}: {
  image: Image;
  transparentColor: Color | undefined;
  fps: number;
}): Promise<string> =>
  new Promise<string>((resolve) => {
    const [width, height] = image.dimensions;
    const gif: GIFEncoder = new GIFEncoder(width, height);

    gif.setFrameRate(fps);
    gif.setRepeat(0); // Loop indefinitely

    // gif.setQuality(10);
    gif.writeHeader();

    if (transparentColor) {
      // Need to convert '#RRGGBB' to '0xRRGGBB'
      const hexColor = colorUtil.toHexColor(transparentColor).slice(1);
      gif.setTransparent(Number(`0x${hexColor}`));
    }

    const data: Buffer[] = [];
    gif.on('data', (chunk: Buffer) => {
      data.push(chunk);
    });
    gif.once('end', () => {
      const blob = new Blob(data, { type: 'image/gif' });
      void miscUtil.blobOrFileToDataUrl(blob).then(resolve);
    });

    image.frames.forEach((f) => {
      gif.addFrame(f);
    });

    gif.finish();
  });

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
