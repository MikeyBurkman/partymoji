import { Dimensions, FrameData } from '../types';
import { assert } from './misc';

export const createCanvas = ([width, height]: Dimensions) => {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  assert(ctx, 'Canvas not supported');
  return { canvas, ctx };
};

export const frameToCanvas = ({
  dimensions,
  frame,
}: {
  dimensions: Dimensions;
  frame: FrameData;
}) => {
  const [width, height] = dimensions;
  const { canvas, ctx } = createCanvas(dimensions);

  ctx.putImageData(new ImageData(frame, width, height), 0, 0);

  return canvas;
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
  preEffect?: (ctx: OffscreenCanvasRenderingContext2D) => void;
  /** Manipulate the context *after* drawing the image. Use this to draw on top of the image */
  postEffect?: (ctx: OffscreenCanvasRenderingContext2D) => void;
}): FrameData => {
  // Create a new Canvas using our existing image.
  // We can then draw that onto a second canvas, which will have effects applied to it.
  const { ctx } = createCanvas(dimensions);

  ctx.save();
  preEffect?.(ctx);
  ctx.drawImage(frameToCanvas({ dimensions, frame }), 0, 0);
  ctx.restore();
  postEffect?.(ctx);

  return ctx.getImageData(0, 0, dimensions[0], dimensions[1]).data;
};
