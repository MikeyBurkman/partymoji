// @ts-ignore
import getPixels from 'get-pixels';
// @ts-ignore
import gifEncoder from 'gif-encoder';
import seedrandom from 'seedrandom';

import { Color, TransformInput, Image, Dimensions, ImageData } from './types';
import {
  toHexColor,
  getPixelFromSource,
  randomColor,
  fromHexColor,
  isTransparent,
} from './utils';

// Returns a list of gif data URLs, for each transform
export const runTransforms = async (
  inputDataUrl: string,
  transformList: TransformInput<any>[],
  fps: number
): Promise<string[]> => {
  const random = seedrandom(inputDataUrl);

  const originalImage = await readImage(inputDataUrl);

  const images: Image[] = [];
  transformList.reduce((image, transformInput) => {
    const result = transformInput.transform.fn({
      image,
      parameters: transformInput.params,
      random,
    });
    images.push(result);
    return result;
  }, originalImage);

  return await Promise.all(
    images.map(async (newImage) => {
      const transparentColor = getTransparentColor(newImage, random);

      // Transform any of our transparent pixels to what our gif understands to be transparent
      const image = encodeTransparency(
        newImage.frames.map((f) => f.data),
        transparentColor
      );

      return await createGif(newImage.dimensions, image, transparentColor, fps);
    })
  );
};

/**
 * Each pixel in our image has an alpha channel, but gifs don't.
 * We transform each pixel that appears transparent to be a designated transparent color.
 */
const encodeTransparency = (
  frames: ImageData[],
  transparentColor: Color | undefined
): ImageData[] => {
  const image = frames.map((frame) => {
    const img: ImageData = [];
    for (let i = 0; i < frame.length; i += 4) {
      if (transparentColor && frame[i + 3] < 128) {
        // Anything more than halfway transparent is considered transparent
        img.push(...transparentColor);
      } else {
        img.push(frame[i]);
        img.push(frame[i + 1]);
        img.push(frame[i + 2]);
        img.push(255); // Gifs don't do transparency, I dunno why they take in an alpha value...
      }
    }
    return img;
  });

  return image;
};

const createGif = async (
  dimensions: Dimensions,
  frames: ImageData[],
  transparentColor: Color | undefined,
  fps: number
): Promise<string> =>
  new Promise<string>((resolve) => {
    const [width, height] = dimensions;
    const gif = new gifEncoder(width, height);

    let data: any[] = [];
    gif.on('data', (chunk: any) => {
      data.push(chunk);
    });
    gif.on('end', () => {
      const dataUrl = URL.createObjectURL(
        new Blob(data, { type: 'image/gif' })
      );
      resolve(dataUrl);
    });

    gif.setFrameRate(fps);
    gif.setRepeat(0); // Loop indefinitely
    if (transparentColor) {
      gif.setTransparent(toHexColor(transparentColor));
    }

    // gif.setQuality(10);
    gif.writeHeader();

    frames.forEach((f) => {
      gif.addFrame(f);
    });

    gif.finish();
  });

const readImage = (dataUrl: string): Promise<Image> =>
  new Promise<Image>((res, rej) =>
    getPixels(
      dataUrl,
      (err: Error, getPixelResults: { shape: Dimensions; data: ImageData }) => {
        if (err) {
          return rej(err);
        } else {
          return res({
            frames: [
              {
                data: getPixelResults.data,
              },
            ],
            dimensions: getPixelResults.shape,
          });
        }
      }
    )
  );

const getTransparentColor = (
  image: Image,
  random: seedrandom.prng
): Color | undefined => {
  let hasTransparent = false;
  const seenPixels = new Set<string>();
  const [width, height] = image.dimensions;
  let attempt = toHexColor([0, 255, 0, 255]); // Just start with green for now, since it's a likely candidate
  image.frames.forEach((frame) => {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const px = getPixelFromSource(image.dimensions, frame.data, [x, y]);
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
  return hasTransparent ? fromHexColor(attempt) : undefined;
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
