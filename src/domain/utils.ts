import { AssertionError } from 'assert';
import * as convert from 'color-convert';
import { range } from 'remeda';
import seedrandom from 'seedrandom';
import {
  Color,
  Coord,
  Dimensions,
  Image,
  FrameData,
  Random,
  EffectFn,
  EffectFnOpts,
} from './types';

/**
 * Converts a Pixel into a hex string like '#00FF00'
 */
export const toHexColor = ([r, g, b]: Color) => {
  const toHexValue = (c: number) => {
    const s = c.toString(16).toUpperCase();
    return s.length === 2 ? s : '0' + s;
  };

  return `#${toHexValue(r)}${toHexValue(g)}${toHexValue(b)}`;
};

export const fromHexColor = (hex: string): Color => [
  parseInt(hex.toUpperCase().substr(1, 2), 16),
  parseInt(hex.toUpperCase().substr(3, 2), 16),
  parseInt(hex.toUpperCase().substr(5, 2), 16),
  255,
];

export const isHexColor = (s: string) => /^#[0-9A-F]{6}$/.test(s);

/**
 * Our effect functions allow for an alpha channel, but gifs do not.
 * All pixels are either fully solid or fully transparent.
 * This function returns true if the color's alpha is below a certain threshold.
 */
export const isTransparent = (pixel: Color) => pixel[3] < 64;

export const randomColor = (random: seedrandom.prng): Color => [
  Math.floor(random.int32() * 256),
  Math.floor(random.int32() * 256),
  Math.floor(random.int32() * 256),
  255,
];

export const getAveragePixelValue = ([r, g, b]: Color) =>
  Math.round((r + g + b) / 3);

export const clamp = (n: number, min: number, max: number) =>
  Math.max(Math.min(n, max), min);

export const clampColor = ([r, g, b, a]: Color): Color => [
  clamp(r, 0, 255),
  clamp(g, 0, 255),
  clamp(b, 0, 255),
  clamp(a, 0, 255),
];

export const TRANSPARENT_COLOR: Color = [0, 0, 0, 0];

export const getPixelFromSource = (
  dimensions: Dimensions,
  image: FrameData,
  coord: Coord
): Color => {
  const [width, height] = dimensions;
  const [x, y] = coord;
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return TRANSPARENT_COLOR; // Default to transparent if an invalid coordinate
  }

  const idx = getImageIndex(dimensions, x, y);
  return [image[idx], image[idx + 1], image[idx + 2], image[idx + 3]];
};

/**
 * Asserts that a given value is truthy. Uses TypeScript 3.7 assertion types.
 *
 * @example
 * ```ts
 * const foo: string|undefined = getSomeData();
 * asert(foo, 'foo must be defined');
 * console.log(foo.length); // OK
 * ```
 */
export function assert(
  condition: unknown,
  message = 'Unexpected falsy value'
): asserts condition {
  if (!condition) {
    throw new AssertionError({ message, actual: condition });
  }
}

/********** Mapping Utils ***********/
// Maps all frames from the original image into new frames.
// Assumes all mapped frames are the same dimension as the original image.
export const mapFrames = (
  image: Image,
  cb: (
    imageData: FrameData,
    frameIndex: number,
    frameCount: number
  ) => FrameData
): Image => ({
  dimensions: image.dimensions,
  frames: image.frames.map((frame, idx) => cb(frame, idx, image.frames.length)),
});

/**
 * Maps the coordinates in a given shape into an image
 */
export const mapCoords = (
  dimensions: Dimensions,
  cb: (coord: Coord) => Color
): FrameData => {
  const [width, height] = dimensions;
  const transformedImageData = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const c = clampColor(cb([x, y]));
      const idx = getImageIndex(dimensions, x, y);
      transformedImageData[idx] = c[0];
      transformedImageData[idx + 1] = c[1];
      transformedImageData[idx + 2] = c[2];
      transformedImageData[idx + 3] = c[3];
    }
  }
  return transformedImageData;
};

/**
 * Combines mapFrames and mapCoords into one function.
 * Used for transforming each pixel in an image into another pixel.
 */
export const mapImage = <T>(
  cb: (args: {
    image: Image;
    dimensions: Dimensions;
    random: Random;
    parameters: T;
    coord: Coord;
    frameCount: number;
    frameIndex: number;
    /** Between 0 and 1 */
    animationProgress: number;
    getSrcPixel: (coord: Coord) => Color;
  }) => Color
): EffectFn<T> => {
  return ({ image, random, parameters }: EffectFnOpts<T>) =>
    mapFrames(image, (imageData, frameIndex, frameCount) =>
      mapCoords(image.dimensions, (coord) =>
        cb({
          image,
          dimensions: image.dimensions,
          random,
          parameters,
          coord,
          frameCount,
          frameIndex,
          animationProgress: frameIndex / frameCount,
          getSrcPixel: (c: Coord) =>
            getPixelFromSource(image.dimensions, imageData, c),
        })
      )
    );
};

/**
 * Similar to mapImage, but the first argument pre-computes some things for
 *  each frame, which is then passed to the second callback function.
 * This is useful for performance (only compute things every frame rather than every pixel),
 *  and also allows you to generate some random value that will be the same for every frame.
 */
export const mapImageWithPrecompute = <T, R>(
  compute: (args: {
    image: Image;
    dimensions: Dimensions;
    random: Random;
    parameters: T;
    frameCount: number;
    frameIndex: number;
    /** Between 0 and 1 */
    animationProgress: number;
  }) => R,
  cb: (args: {
    computed: R;
    image: Image;
    dimensions: Dimensions;
    random: Random;
    parameters: T;
    coord: Coord;
    frameCount: number;
    frameIndex: number;
    /** Between 0 and 1 */
    animationProgress: number;
    getSrcPixel: (coord: Coord) => Color;
  }) => Color
): EffectFn<T> => {
  return ({ image, random, parameters }: EffectFnOpts<T>) =>
    mapFrames(image, (imageData, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const computed = compute({
        image,
        dimensions: image.dimensions,
        random,
        parameters,
        frameCount,
        frameIndex,
        animationProgress,
      });

      return mapCoords(image.dimensions, (coord) =>
        cb({
          computed,
          image,
          dimensions: image.dimensions,
          random,
          parameters,
          coord,
          frameCount,
          frameIndex,
          animationProgress,
          getSrcPixel: (c: Coord) =>
            getPixelFromSource(image.dimensions, imageData, c),
        })
      );
    });
};

export const getImageIndex = ([width]: Dimensions, x: number, y: number) =>
  (x + y * width) * 4;

/**
 * Change the dimensions of the image, scaling it to make it fit the new dimensions
 */
export const scaleImage = (args: {
  image: Image;
  newWidth: number;
  newHeight: number;
}): Image => {
  const { image, newWidth, newHeight } = args;
  const [width, height] = image.dimensions;
  const xRatio = width / newWidth;
  const yRatio = height / newHeight;

  const newImage = createNewImage({
    dimensions: [newWidth, newHeight],
    frameCount: image.frames.length,
  });

  for (
    let frameIndex = 0;
    frameIndex < newImage.frames.length;
    frameIndex += 1
  ) {
    for (let y = 0; y < newHeight; y += 1) {
      for (let x = 0; x < newWidth; x += 1) {
        // Simple nearest-neighbor image scaling.
        // Arguably the worst of the scaling algorithms, but it's quick,
        //  and we're generally dealing with small images anyhow.
        const srcX = Math.floor(x * xRatio);
        const srcY = Math.floor(y * yRatio);

        const color = getPixel({
          image,
          frameIndex,
          coord: [srcX, srcY],
        });
        setPixel({
          image: newImage,
          frameIndex,
          color,
          coord: [x, y],
        });
      }
    }
  }

  return newImage;
};

/**
 * Will change the image dimensions without altering the scale.
 * If the new dimensions are larger, the image will be centered.
 * If the new dimensions are smaller, it'll be cropped
 */
export const resizeImage = ({
  image,
  newWidth,
  newHeight,
}: {
  image: Image;
  newWidth: number;
  newHeight: number;
}): Image => {
  const [sourceWidth, sourceHeight] = image.dimensions;

  const xPadding = Math.round((newWidth - sourceWidth) / 2);
  const yPadding = Math.round((newHeight - sourceHeight) / 2);

  const newImage = createNewImage({
    dimensions: [newWidth, newHeight],
    frameCount: image.frames.length,
  });

  for (
    let frameIndex = 0;
    frameIndex < newImage.frames.length;
    frameIndex += 1
  ) {
    for (let y = 0; y < newHeight; y += 1) {
      for (let x = 0; x < newWidth; x += 1) {
        const color: Color =
          x > xPadding &&
          x < newWidth - xPadding &&
          y > yPadding &&
          y < newHeight - yPadding
            ? getPixel({
                image,
                frameIndex,
                coord: [x - xPadding, y - yPadding],
              })
            : TRANSPARENT_COLOR;
        setPixel({
          image: newImage,
          frameIndex,
          coord: [x, y],
          color,
        });
      }
    }
  }

  return newImage;
};

export const createNewImage = (args: {
  frameCount: number;
  dimensions: Dimensions;
}): Image => ({
  dimensions: args.dimensions,
  frames: range(0, args.frameCount).map(
    // 4 == bytes used per color (RGBA)
    () => new Uint8ClampedArray(args.dimensions[0] * args.dimensions[1] * 4)
  ),
});

export const duplicateImage = (image: Image): Image => ({
  dimensions: image.dimensions,
  frames: image.frames.map((f) => new Uint8ClampedArray(f)),
});

export const getPixel = (args: {
  image: Image;
  frameIndex: number;
  coord: Coord;
}) =>
  getPixelFromSource(
    args.image.dimensions,
    args.image.frames[args.frameIndex],
    args.coord
  );

export const setPixel = (args: {
  image: Image;
  frameIndex: number;
  coord: Coord;
  color: Color;
}) => {
  const idx = getImageIndex(
    args.image.dimensions,
    args.coord[0],
    args.coord[1]
  );
  const frame = args.image.frames[args.frameIndex];
  frame[idx] = args.color[0];
  frame[idx + 1] = args.color[1];
  frame[idx + 2] = args.color[2];
  frame[idx + 3] = args.color[3];
};

/**
 * Calculate a value between v1 and v2, determined by percent.
 * @param percent Between 0 and 100. 0 is all v1, and 100 is all v2.
 */
export const weightedValue = (percent: number, v1: number, v2: number) =>
  (1 - percent / 100) * v1 + (percent / 100) * v2;

/**
 * Shift the hue of the pixel towards a certain color, by a certain amount percentage
 * @param hue [0, 360)
 * @param amount [0, 100]
 */
export const shiftTowardsHue = (
  [r, g, b, a]: Color,
  hue: number,
  amount: number
): Color => {
  const [, s, l] = convert.rgb.hsl([r, g, b]);
  const [newR, newG, newB] = convert.hsl.rgb([
    hue,
    weightedValue(amount, s, 100),
    l,
  ]);
  return [
    weightedValue(amount, r, newR),
    weightedValue(amount, g, newG),
    weightedValue(amount, b, newB),
    a,
  ];
};

/**
 * Adds the given amount to the hue of the color.
 * Amount should be between 0 and 360
 */
export const shiftHue = ([r, g, b, a]: Color, amount: number): Color => {
  const [h, s, l] = convert.rgb.hsl([r, g, b]);
  const [newR, newG, newB] = convert.hsl.rgb([(h + amount) % 360, s, l]);
  return [newR, newG, newB, a];
};

/**
 * Returns the angle in degrees (0 to 360) from c2 to c1
 */
export const calculateAngle = (c1: Coord, c2: Coord): number => {
  const xRelCenter = c2[0] - c1[0];
  const yRelCenter = c2[1] - c1[1];
  return (360 + (Math.atan2(yRelCenter, xRelCenter) * 180) / Math.PI) % 360;
};

export const pointDistance = ([x1, y1]: Coord, [x2, y2]: Coord): number => {
  const xDiff = Math.pow(x2 - x1, 2);
  const yDiff = Math.pow(y2 - y1, 2);
  return Math.sqrt(xDiff + yDiff);
};

/**
 * Turn a hue value (0 - 360) into a Color
 */
export const colorFromHue = (hue: number): Color => [
  ...convert.hsl.rgb([hue, 100, 50]),
  255,
];

export const adjustSaturation = (color: Color, amount: number): Color => {
  const [r, g, b, a] = color;
  const [h, s, l] = convert.rgb.hsl(r, g, b);
  const newSat = weightedValue(Math.abs(amount), s, amount >= 0 ? 100 : 0);
  const [newR, newG, newB] = convert.hsl.rgb([h, newSat, l]);
  return [newR, newG, newB, a];
};

// Amount: -100 to 100
export const adjustBrightness = (color: Color, amount: number): Color => {
  const d = (amount / 100) * 128;
  const [r, g, b, a] = color;
  return clampColor([r + d, g + d, b + d, a]);
};

// Amount: -100 to 100
export const adjustContrast = (color: Color, amount: number): Color => {
  const d = amount / 100 + 1;
  const [r, g, b, a] = color;
  return clampColor([
    d * (r - 128) + 128,
    d * (g - 128) + 128,
    d * (b - 128) + 128,
    a,
  ]);
};

/**
 * Returns number between 0 and 1, where 1 is the largest difference and 0 is no difference
 */
export const colorDiff = (c1: Color, c2: Color): number => {
  // Red-mean color diff algorithm
  // https://en.wikipedia.org/wiki/Color_difference
  const deltaRed = c1[0] - c2[0];
  const deltaBlue = c1[1] - c2[1];
  const deltaGreen = c1[2] - c2[2];
  const rSomething = (c1[0] + c2[0]) / 2;

  const rComponent = (2 + rSomething / 256) * deltaRed * deltaRed;
  const bComponent = (2 + (255 - rSomething) / 256) * deltaBlue * deltaBlue;
  const gComponent = 4 * deltaGreen * deltaGreen;
  // 765 = ~ difference between black and white pixels
  return Math.sqrt(rComponent + bComponent + gComponent) / 765;
};

export const changeFrameCount = (image: Image, frameCount: number): Image => {
  const currentFrames = image.frames;

  // Resulting image will contain frameCount frames.
  // If the original image had fewer than that, then we'll
  //  duplicate some frames to approximately slow the animation.
  // If the original has more frames, then we'll discard some frames.
  return {
    dimensions: image.dimensions,
    frames: range(0, frameCount).map((i) => {
      const frameToCopy = Math.floor((i / frameCount) * currentFrames.length);
      return currentFrames[frameToCopy];
    }),
  };
};

/** Returns a new array where the item at the given index is replaced by the given value */
export const replaceIndex = <T>(
  arr: T[],
  index: number,
  newValueFn: (oldValue: T) => T
): T[] => arr.map((x, i) => (index === i ? newValueFn(x) : x));

export const debounce = <T extends Function>(func: T, timeout: number): T => {
  let timer: NodeJS.Timeout | undefined;
  return ((...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func(args);
    }, timeout);
  }) as any as T;
};

export const isUrl = (s: string): boolean =>
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
    s
  );

export const copyToClipboard = (s: string): Promise<void> =>
  navigator.clipboard.writeText(s);

export const readFromClipboard = (): Promise<string> =>
  navigator.clipboard.readText();

/**
 * Allows you to apply a JS Canvas to an image.
 * Use the `preEffect` and `postEffect` functions to maniuplate the image
 *  both before and after drawing the image to the canvas.
 */
export const applyCanvasFromFrame = ({
  dimensions,
  frame,
  preEffect,
  postEffect,
}: {
  dimensions: Dimensions;
  frame: FrameData;
  /** Manipulate the context *before* drawing the image. Set things like filters here */
  preEffect?: (ctx: OffscreenCanvasRenderingContext2D) => void;
  /** Manipulate the context *after* drawing the image. Use this to draw on top of the image */
  postEffect?: (ctx: OffscreenCanvasRenderingContext2D) => void;
}): FrameData => {
  const [width, height] = dimensions;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  // Create a new Canvas using our existing image.
  // We can then draw that onto a new one, which will allow effects to be made to it.
  // Surely there's a better way of doing this...
  ctx.putImageData(new ImageData(frame, width, height), 0, 0);

  const newCanvas = new OffscreenCanvas(width, height);
  const ctxNew = newCanvas.getContext('2d');
  if (!ctxNew) {
    throw new Error('Canvas not supported');
  }

  ctxNew.save();
  preEffect?.(ctxNew);
  ctxNew.drawImage(canvas, 0, 0);
  ctxNew.restore();
  postEffect?.(ctxNew);

  return ctxNew.getImageData(0, 0, width, height).data;
};
