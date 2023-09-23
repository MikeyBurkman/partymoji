import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyFilter } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { sliderParam } from '../params/sliderParam';

export const party = buildEffect({
  name: 'Party',
  description: 'Shift the hue of the image over the course of the animation',
  params: [
    sliderParam({
      name: 'Shift Speed',
      description: 'Controls how quickly it shifts through the various colors',
      min: 1,
      max: 12,
      defaultValue: 1,
    }),
  ] as const,
  fn: ({ image, parameters: [speed] }) =>
    mapFrames(image, (frame, frameIndex, frameCount) =>
      applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          applyFilter(canvasData, {
            hueRotate: (frameIndex / frameCount) * 360 * speed,
          }),
      })
    ),
});
