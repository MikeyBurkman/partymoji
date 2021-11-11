// @ts-ignore
import getPixels from 'get-pixels';
// @ts-ignore
import gifEncoder from 'gif-encoder';
import seedrandom from 'seedrandom';
import { Color, Dimensions, Image, ImageData, TransformInput } from './types';
import {
  fromHexColor,
  getPixelFromSource,
  isTransparent,
  randomColor,
  toHexColor,
} from './utils';

interface RunArgs {
  inputDataUrl: string;
  transformList: TransformInput<any>[];
  fps: number;
  onImageFinished: () => void;
}

interface ImageResult {
  gif: string;
  width: number;
  height: number;
}

// Returns a list of gif data URLs, for each transform
export const runTransforms = async ({
  transformList,
  inputDataUrl,
  fps,
  onImageFinished,
}: RunArgs): Promise<ImageResult[]> => {
  const random = seedrandom(inputDataUrl);

  const originalImage = await readImage(inputDataUrl);

  const results: ImageResult[] = [];
  let currentImage = originalImage;

  for (const transformInput of transformList) {
    const result = transformInput.transform.fn({
      image: currentImage,
      parameters: transformInput.params,
      random,
    });

    const transparentColor = getTransparentColor(result, random);

    // Transform any of our transparent pixels to what our gif understands to be transparent
    const image = encodeTransparency(result.frames, transparentColor);

    const gif = await createGif(
      result.dimensions,
      image,
      transparentColor,
      fps
    );

    onImageFinished();

    currentImage = result;
    results.push({
      gif,
      width: result.dimensions[0],
      height: result.dimensions[1],
    });
  }

  return results;
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
    const img = new Uint8Array(frame.length);
    for (let i = 0; i < frame.length; i += 4) {
      if (transparentColor && frame[i + 3] < 128) {
        // Anything more than halfway transparent is considered transparent
        img[i] = transparentColor[0];
        img[i + 1] = transparentColor[1];
        img[i + 2] = transparentColor[2];
        img[i + 3] = transparentColor[3];
      } else {
        img[i] = frame[i];
        img[i + 1] = frame[i + 1];
        img[i + 2] = frame[i + 2];
        img[i + 3] = 255; // Gifs don't do transparency, I dunno why they take in an alpha value...
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

    gif.setFrameRate(fps);
    gif.setRepeat(0); // Loop indefinitely
    if (transparentColor) {
      // Need to convert '#RRGGBB' to '0xRRGGBB'
      const hexColor = toHexColor(transparentColor).slice(1);
      gif.setTransparent(`0x${hexColor}`);
    }

    // gif.setQuality(10);
    gif.writeHeader();

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

    frames.forEach((f) => {
      gif.addFrame(f);
    });

    gif.finish();
  });

export const readImage = (dataUrl: string): Promise<Image> =>
  new Promise<Image>((res, rej) =>
    getPixels(
      dataUrl,
      (err: Error, results: { shape: number[]; data: ImageData }) => {
        if (err) {
          return rej(err);
        }

        if (results.shape.length === 3) {
          // Single frame
          return res({
            frames: [Uint8Array.from(results.data)],
            dimensions: [results.shape[0], results.shape[1]],
          });
        }

        // Multiple frames, need to slice up the image data into numFrames slices
        const [numFrames, width, height] = results.shape;
        const sliceSize = width * height * 4;
        const frames: Uint8Array[] = [];
        for (let i = 0; i < numFrames; i += 1) {
          frames.push(
            results.data.subarray(i * sliceSize, (i + 1) * sliceSize)
          );
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
): Color | undefined => {
  let hasTransparent = false;
  const seenPixels = new Set<string>();
  const [width, height] = image.dimensions;
  let attempt = toHexColor([0, 255, 0, 255]); // Just start with green for now, since it's a likely candidate
  image.frames.forEach((frame) => {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const px = getPixelFromSource(image.dimensions, frame, [x, y]);
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
