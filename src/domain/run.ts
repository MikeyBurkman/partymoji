// @ts-ignore
import getPixels from 'get-pixels';
// @ts-ignore
import gifEncoder from 'gif-encoder';
import seedrandom from 'seedrandom';
import { effectByName } from '../effects';
import {
  Color,
  Image,
  FrameData,
  ImageEffectResult,
  EffectInput,
} from './types';
import {
  fromHexColor,
  isPartiallyTransparent,
  isTransparent,
  randomColor,
  toHexColor,
} from './utils/color';
import { getPixelFromSource } from './utils/image';
import { fakeTransparency } from '../effects/fake-transparency';

export interface RunArgs {
  randomSeed: string;
  image: Image;
  effectInput: EffectInput;
  fps: number;
}

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
    parameters: effectInput.params,
    random,
  });

  const { transparentColor, hasPartialTransparency } = getTransparentColor(
    result,
    random
  );

  const gif = await createGif({
    // Transform any of our transparent pixels to what our gif understands to be transparent
    image: encodeTransparency(result, transparentColor),
    transparentColor,
    fps,
  });

  const resultWithBG = hasPartialTransparency
    ? await fakeTransparency.fn({
        image: result,
        parameters: [],
        random,
      })
    : null;

  return {
    gif,
    image: result,
    gifWithBackgroundColor: resultWithBG
      ? await createGif({
          image: resultWithBG,
          transparentColor: undefined,
          fps,
        })
      : gif,
    partiallyTransparent: hasPartialTransparency,
  };
};

/**
 * Each pixel in our image has an alpha channel, but gifs don't.
 * We transform each pixel that appears transparent to be a designated transparent color.
 */
const encodeTransparency = (
  image: Image,
  transparentColor: Color | undefined
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
    const gif = new gifEncoder(width, height);

    gif.setFrameRate(fps);
    gif.setRepeat(0); // Loop indefinitely

    // gif.setQuality(10);
    gif.writeHeader();

    if (transparentColor) {
      // Need to convert '#RRGGBB' to '0xRRGGBB'
      const hexColor = toHexColor(transparentColor).slice(1);
      gif.setTransparent(`0x${hexColor}`);
    }

    let data: any[] = [];
    gif.on('data', (chunk: any) => {
      data.push(chunk);
    });
    gif.on('end', async () => {
      const blob = new Blob(data, { type: 'image/gif' });
      const dataUrl = await blobOrFileToDataUrl(blob);
      resolve(dataUrl);
    });

    image.frames.forEach((f) => {
      gif.addFrame(f);
    });

    gif.finish();
  });

export const readImage = (dataUrl: string): Promise<Image> =>
  new Promise<Image>((res, rej) =>
    getPixels(
      dataUrl,
      (err: Error, results: { shape: number[]; data: FrameData }) => {
        if (err) {
          return rej(err);
        }

        if (results.shape.length === 3) {
          const [width, height] = results.shape;
          // Single frame
          return res({
            frames: [Uint8ClampedArray.from(results.data)],
            dimensions: [width, height],
          });
        }

        // Multiple frames, need to slice up the image data into numFrames slices
        const [numFrames, width, height] = results.shape;
        const sliceSize = width * height * 4;
        const frames: Uint8ClampedArray[] = [];
        for (let i = 0; i < numFrames; i += 1) {
          const frame = results.data.subarray(
            i * sliceSize,
            (i + 1) * sliceSize
          );
          // Contrary to the TS types, the result of subarray returns a regular Uint8Array, NOT a clamped one!
          frames.push(Uint8ClampedArray.from(frame));
        }
        return res({
          frames,
          dimensions: [width, height],
        });
      }
    )
  );

const getTransparentColor = (
  image: Image,
  random: seedrandom.prng
): {
  transparentColor: Color | undefined;
  hasPartialTransparency: boolean;
} => {
  let hasTransparent = false;
  const seenPixels = new Set<string>();
  const [width, height] = image.dimensions;
  let hasPartialTransparency = false;
  let attempt = toHexColor([0, 255, 0, 255]); // Just start with green for now, since it's a likely candidate
  image.frames.forEach((frame) => {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const px = getPixelFromSource(image.dimensions, frame, [x, y]);
        if (isPartiallyTransparent(px)) {
          hasPartialTransparency = true;
        }
        if (isTransparent(px)) {
          hasTransparent = true;
        } else {
          const hex = toHexColor(px);
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
    transparentColor: hasTransparent ? fromHexColor(attempt) : undefined,
    hasPartialTransparency,
  };
};

const findRandomColorNotInSet = (
  random: seedrandom.prng,
  set: Set<string>,
  attempts = 0
): string => {
  const col = toHexColor(randomColor(random));
  if (attempts > 2000) {
    // Just give up in order to prevent a stack overflow or something...
    return col;
  }
  return set.has(col)
    ? findRandomColorNotInSet(random, set, attempts + 1)
    : col;
};

export const blobOrFileToDataUrl = (file: File | Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
