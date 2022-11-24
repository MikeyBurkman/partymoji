import { range } from 'remeda';
import {
  Color,
  Coord,
  Dimensions,
  EffectFn,
  EffectFnOpts,
  FrameData,
  Image,
  Random,
} from '../types';
import {
  applyCanvasFromFrame,
  applyTransform,
  canvasToFrame,
  createCanvas,
  frameToCanvas,
} from './canvas';
import { clampColor, TRANSPARENT_COLOR } from './color';

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
 * Scales the image according to a coefficient
 * Coefficient should be greater than 0.
 * A coefficient of 1 equals no scaling.
 * The image will be centered.
 */
export const scaleImage = ({
  image,
  horizontalScale,
  verticalScale,
}: {
  image: Image;
  horizontalScale?: number;
  verticalScale?: number;
}): Image => {
  const [width, height] = image.dimensions;
  // Adjust how much the image is offset in order to keep it centered
  const offsetX = (width / 2) * (horizontalScale ?? 1) - width / 2;
  const offsetY = (height / 2) * (verticalScale ?? 1) - height / 2;
  return mapFrames(image, (imageData) =>
    applyCanvasFromFrame({
      dimensions: image.dimensions,
      frame: imageData,
      preEffect: (canvasData) =>
        applyTransform(canvasData, {
          horizontalScale,
          verticalScale,
          horizontalTranslation: -offsetX,
          verticalTranslation: -offsetY,
        }),
    })
  );
};

/**
 * Resize the image to the given dimensions.
 * If `keepScale` is true, then the image will be automatically
 *  resized to keep match the new dimensions.
 * If false, then the image will remain the same size, and will be cropped
 *  if the new dimensions are smaller.
 */
export const resizeImage = ({
  image,
  newWidth,
  newHeight,
  keepScale,
}: {
  image: Image;
  newWidth: number;
  newHeight: number;
  keepScale: boolean;
}): Image => {
  const newFrames = mapFrames(image, (frame) => {
    const rootCanvas = createCanvas([newWidth, newHeight]);
    const imgCanvas = frameToCanvas({ dimensions: image.dimensions, frame });

    if (keepScale) {
      // Just blow it up
      rootCanvas.ctx.drawImage(imgCanvas.canvas, 0, 0, newWidth, newHeight);
    } else {
      // Keep the image the same size, but be sure to center it
      const offsetX = newWidth / 2 - image.dimensions[0] / 2;
      const offsetY = newHeight / 2 - image.dimensions[1] / 2;
      rootCanvas.ctx.drawImage(
        imgCanvas.canvas,
        offsetX,
        offsetY,
        image.dimensions[0],
        image.dimensions[1]
      );
    }

    return canvasToFrame(rootCanvas);
  });

  return {
    dimensions: [newWidth, newHeight],
    frames: newFrames.frames,
  };
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
