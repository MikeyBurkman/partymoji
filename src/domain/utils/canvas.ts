import type { CanvasData, Dimensions, FrameData, Color } from '~/domain/types';
import { toHexColor } from './color';
import { IS_WORKER } from '../isWorker';
import { assert } from './misc';

export const createCanvas = ([width, height]: Dimensions): CanvasData => {
  if (IS_WORKER) {
    // Note that mobile does NOT support OffscreenCanvas.
    // So if mobile, then we can not use web workers!
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    assert(ctx, 'Canvas not supported');
    return { canvas, ctx };
  } else {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    assert(ctx, 'Canvas not supported');
    return { canvas, ctx };
  }
};

/** Converts a frame to a CanvasData */
export const frameToCanvas = ({
  dimensions,
  frame,
}: {
  dimensions: Dimensions;
  frame: FrameData;
}): CanvasData => {
  const [width, height] = dimensions;
  const { canvas, ctx } = createCanvas(dimensions);

  const imageData = new ImageData(frame, width, height);

  ctx.putImageData(imageData, 0, 0);

  return { canvas, ctx };
};

/** Convert a CanvasData into a FrameData */
export const canvasToFrame = (canvasData: CanvasData): FrameData => {
  const imageData = canvasData.ctx.getImageData(
    0,
    0,
    canvasData.canvas.width,
    canvasData.canvas.height,
  );
  return imageData.data;
};

/**
 * Draws a frame onto the canvas.
 * This respects transforms applied to the canvas, such as scaling.
 */
export const drawImageOnCanvas = ({
  ctx,
  dimensions,
  frame,
}: {
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  dimensions: Dimensions;
  frame: FrameData;
}): void => {
  ctx.drawImage(frameToCanvas({ dimensions, frame }).canvas, 0, 0);
};

/**
 * Allows you to apply a JS Canvas to an image.
 * Use the `preEffect` and `postEffect` functions to manipulate the image
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
  preEffect?: (canvasData: CanvasData) => void;
  /** Manipulate the context *after* drawing the image. Use this to draw on top of the image */
  postEffect?: (canvasData: CanvasData) => void;
}): FrameData => {
  // Create a new Canvas using our existing image.
  // We can then draw that onto a second canvas, which will have effects applied to it.
  const canvasData = createCanvas(dimensions);

  canvasData.ctx.save();
  preEffect?.(canvasData);
  canvasData.ctx.drawImage(frameToCanvas({ dimensions, frame }).canvas, 0, 0);
  canvasData.ctx.restore();
  postEffect?.(canvasData);

  return canvasData.ctx.getImageData(0, 0, dimensions[0], dimensions[1]).data;
};

/**
 * Combines two canvases or frames together.
 * It's assumed that the foreground has some transparency to it.
 */
export const combineImages = ({
  dimensions,
  background,
  foreground,
}: {
  dimensions: Dimensions;
  background: FrameData | CanvasData;
  foreground: FrameData | CanvasData;
}): FrameData => {
  const backgroundCanvas =
    'canvas' in background
      ? background
      : frameToCanvas({
          dimensions: dimensions,
          frame: background,
        });

  const foregroundCanvas =
    'canvas' in foreground
      ? foreground
      : frameToCanvas({
          dimensions: dimensions,
          frame: foreground,
        });

  backgroundCanvas.ctx.drawImage(foregroundCanvas.canvas, 0, 0);

  return canvasToFrame(backgroundCanvas);
};

export const applyFilter = (
  canvas: CanvasData,
  {
    blur,
    brightness,
    contrast,
    opacity,
    saturation,
    hueRotate,
    sepia,
    dropShadow,
  }: {
    /** Number of pixels */
    blur?: number;
    /** [0, 100) percent */
    opacity?: number;
    /** [0, 100) percent */
    brightness?: number;
    /** [0, 100) percent */
    contrast?: number;
    /** [0, 100) percent */
    saturation?: number;
    /** [0, 360) degrees */
    hueRotate?: number;
    /** [0, 100) percent */
    sepia?: number;
    dropShadow?: {
      offsetX: number;
      offsetY: number;
      color: Color;
      /** Positive number, defaults to 0 */
      blurRadius?: number;
    };
  },
): CanvasData => {
  const shadow = dropShadow
    ? [
        `${dropShadow.offsetX}px`,
        `${dropShadow.offsetY}px`,
        `${dropShadow.blurRadius ?? 0}px`,
        toHexColor(dropShadow.color),
      ].join(' ')
    : null;

  const filters = [
    blur == null ? '' : `blur(${blur}px)`,
    brightness == null ? '' : `brightness(${brightness}%)`,
    contrast == null ? '' : `contrast(${contrast}%)`,
    opacity == null ? '' : `opacity(${opacity}%)`,
    saturation == null ? '' : `saturate(${saturation}%)`,
    hueRotate == null ? '' : `hue-rotate(${hueRotate}deg)`,
    sepia == null ? '' : `sepia(${sepia}%)`,
    shadow == null ? '' : `drop-shadow(${shadow})`,
  ].filter((x) => x.length > 0);

  canvas.ctx.filter = filters.join(' ');

  return canvas;
};

export const applyTransform = (
  canvas: CanvasData,
  {
    horizontalScale,
    verticalScale,
    horizontalSkew,
    verticalSkew,
    horizontalTranslation,
    verticalTranslation,
  }: {
    horizontalScale?: number;
    verticalScale?: number;
    horizontalSkew?: number;
    verticalSkew?: number;
    horizontalTranslation?: number;
    verticalTranslation?: number;
  },
): CanvasData => {
  canvas.ctx.transform(
    horizontalScale ?? 1,
    verticalSkew ?? 0,
    horizontalSkew ?? 0,
    verticalScale ?? 1,
    horizontalTranslation ?? 0,
    verticalTranslation ?? 0,
  );
  return canvas;
};

/**
 * Rotates a canvas a number of degrees.
 * 0 degrees points to the right, 90 degrees points up.
 */
export const applyRotation = (
  canvas: CanvasData,
  degrees: number,
): CanvasData => {
  const offsetX = canvas.canvas.width / 2;
  const offsetY = canvas.canvas.height / 2;
  applyTransform(canvas, {
    horizontalTranslation: offsetX,
    verticalTranslation: offsetY,
  });
  const radians = -(degrees * Math.PI) / 180;
  canvas.ctx.rotate(radians);
  applyTransform(canvas, {
    horizontalTranslation: -offsetX,
    verticalTranslation: -offsetY,
  });
  return canvas;
};

/**
 * Scales the canvas a given amount for the x and or y axis.
 * A scale of 1 leaves the image unchanged.
 */
export const applyScale = (
  canvas: CanvasData,
  [x, y]: [number, number],
): CanvasData => {
  canvas.ctx.scale(x, y);
  return canvas;
};
