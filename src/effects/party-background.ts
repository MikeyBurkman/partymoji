import { buildEffect } from '../domain/types';
import {
  applyCanvasFromFrame,
  applyFilter,
  combineImages,
} from '../domain/utils/canvas';
import { colorFromHue } from '../domain/utils/color';
import { mapCoords, mapFrames } from '../domain/utils/image';
import { sliderParam } from '../params/sliderParam';

export const partyBackground = buildEffect({
  name: 'Party Background',
  description:
    'Smoothly cycles through background colors over the course of the animation',
  params: [
    sliderParam({
      name: 'Shift Speed',
      description: 'Controls how quickly it shifts through the various colors',
      min: 1,
      max: 12,
      defaultValue: 1,
    }),
    sliderParam({
      name: 'Foreground Opacity',
      defaultValue: 100,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image, parameters: [shiftSpeed, opacity] }) =>
    mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const newH = (animationProgress * shiftSpeed * 360) % 360;
      const bgColor = colorFromHue(newH);

      const foreground =
        opacity === 100
          ? frame
          : applyCanvasFromFrame({
              dimensions: image.dimensions,
              frame,
              preEffect: (canvasData) => applyFilter(canvasData, { opacity }),
            });

      return combineImages({
        dimensions: image.dimensions,
        background: mapCoords(image.dimensions, () => bgColor),
        foreground,
      });
    }),
});
