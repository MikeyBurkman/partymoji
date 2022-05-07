// @ts-ignore
import getPixels from 'get-pixels';
// @ts-ignore
import gifEncoder from 'gif-encoder';
import { sortBy } from 'remeda';
import seedrandom from 'seedrandom';
import { transformByName } from '../transforms';
import {
  Color,
  Dimensions,
  Image,
  ImageData,
  ImageTransformResult,
  TransformInput,
} from './types';
import {
  fromHexColor,
  getPixelFromFrame,
  getPixelFromSource,
  isTransparent,
  mapCoords,
  randomColor,
  toHexColor,
  TRANSPARENT_COLOR,
} from './utils';

export interface RunArgs {
  inputDataUrl: string;
  originalImage: Image;
  transformList: TransformInput[];
  fps: number;
}

// Returns a list of gif data URLs, for each transform
export const runTransforms = async (
  args: RunArgs,
  cb: (result: ImageTransformResult) => void
): Promise<void> => {
  const { originalImage, transformList, inputDataUrl, fps } = args;
  const random = seedrandom(inputDataUrl);

  let currentImage = originalImage;

  for (let idx = 0; idx < transformList.length; idx += 1) {
    const transformInput = transformList[idx];
    const transform = transformByName(transformInput.transformName);
    const result = transform.fn({
      image: currentImage,
      parameters: transformInput.params,
      random,
    });

    const transparentColor = getTransparentColor(result, random);

    // Transform any of our transparent pixels to what our gif understands to be transparent
    // const image = encodeTransparency(result, transparentColor);

    const gif = await createGif({
      image: result,
      transparentColor,
      fps,
    });

    currentImage = result;
    cb({
      gif,
      width: result.dimensions[0],
      height: result.dimensions[1],
    });
  }
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
    const img = new Uint8Array(frame.length);
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
        img[i + 3] = 255; // Full opaque
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

    // if (transparentColor) {
    // Need to convert '#RRGGBB' to '0xRRGGBB'
    //const hexColor = toHexColor(transparentColor).slice(1);
    //gif.setTransparent(`0x${hexColor}`);
    // }

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

    image.frames.forEach((f) => {
      try {
        const { frameData, palette } = buildFramePalette(
          image.dimensions,
          f,
          transparentColor
        );
        gif.addFrame(frameData, {
          indexedPixels: true,
          palette,
        });
      } catch (err) {
        console.error(err);
      }
      // gif.addFrame(f);
    });

    gif.finish();
  });

/**
 * Builds a palette map of color -> palette index
 */
const buildFramePalette = (
  dimensions: Dimensions,
  frame: Uint8Array,
  transparentColor: Color | undefined
) => {
  const palette = new Map<string, number>();
  if (transparentColor) {
    // Transparent color is always index 0 in the palette
    palette.set(toHexColor(transparentColor), 0);
  }
  mapCoords(dimensions, (coord) => {
    const px = toHexColor(getPixelFromFrame({ coord, dimensions, frame }));
    if (!palette.has(px)) {
      palette.set(px, palette.size);
    }
    return TRANSPARENT_COLOR; // Not actually used, just makes TS happy
  });

  const paletteArray = sortBy(
    Array.from(palette.entries()),
    ([hexColor, index]) => index
  ).flatMap(([hexColor]) => fromHexColor(hexColor));

  console.log(palette);

  const frameData = new Uint8Array(dimensions[0] * dimensions[1]); // One value per pixel
  let currFrameDataIndex = 0;
  mapCoords(dimensions, (coord) => {
    const px = getPixelFromFrame({ coord, dimensions, frame });
    // console.log('px', {
    //   coord,
    //   px,
    //   hex: toHexColor(px),
    //   pal: palette.get(toHexColor(px)),
    //   trans: isTransparent(px),
    // });
    if (isTransparent(px)) {
      frameData[currFrameDataIndex] = 0;
    } else {
      const paletteIndex = palette.get(toHexColor(px));
      frameData[currFrameDataIndex] = paletteIndex!;
    }
    currFrameDataIndex += 1;
    return TRANSPARENT_COLOR; // Not actually used, just makes TS happy
  });

  console.log(frameData);

  return {
    palette: new Uint8Array(paletteArray),
    frameData,
  };
};

export const readImage = (dataUrl: string): Promise<Image> =>
  new Promise<Image>((res, rej) =>
    getPixels(
      dataUrl,
      (err: Error, results: { shape: number[]; data: ImageData }) => {
        if (err) {
          return rej(err);
        }

        if (results.shape.length === 3) {
          const [width, height] = results.shape;
          // Single frame
          return res({
            frames: [Uint8Array.from(results.data)],
            dimensions: [width, height],
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
