import { CanvasData, Dimensions, FrameData } from '../types';
import { assert } from './misc';

export const createCanvas = ([width, height]: Dimensions): CanvasData => {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  assert(ctx, 'Canvas not supported');
  return { canvas, ctx };
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

  ctx.putImageData(new ImageData(frame, width, height), 0, 0);

  return { canvas, ctx };
};

/** Convert a CanvasData into a FrameData */
export const canvasToFrame = (canvasData: CanvasData): FrameData => {
  const imageData = canvasData.ctx.getImageData(
    0,
    0,
    canvasData.canvas.width,
    canvasData.canvas.height
  );
  return imageData.data;
};

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

/** Combines two canvases together. It's assumed that the first frame has some transparency to it. */
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
  }: {
    opacity?: number;
    blur?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
  }
): CanvasData => {
  const filters = [
    blur == null ? '' : `blur(${blur}px)`,
    brightness == null ? '' : `brightness(${brightness}%)`,
    contrast == null ? '' : `contrast(${contrast}%)`,
    opacity == null ? '' : `opacity(${opacity}%)`,
    saturation == null ? '' : `saturate(${saturation}%)`,
  ].filter((x) => x.length > 0);

  canvas.ctx.filter = filters.join(' ');

  return canvas;
};
