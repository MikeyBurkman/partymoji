import { buildEffect, Coord } from '../domain/types';
import {
  applyCanvasFromFrame,
  applyFilter,
  combineImages,
} from '../domain/utils/canvas';
import { calculateAngle, colorFromHue } from '../domain/utils/color';
import { mapCoords, mapFrames } from '../domain/utils/image';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const pinwheelRainbowBackground = buildEffect({
  name: 'Pinwheel Rainbow Background',
  description: 'Create a background pinwheel of rainbow colors',
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
    }),
    intParam({
      name: 'Offset X',
      description: 'Change the horizontal center of the pinwheel',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      description: 'Change the vertical center of the pinwheel',
      defaultValue: 0,
    }),
    sliderParam({
      name: 'Foreground Opacity',
      defaultValue: 100,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image, parameters: [groupCount, offsetX, offsetY, opacity] }) =>
    mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const [width, height] = image.dimensions;
      const center: Coord = [width / 2 + offsetX, height / 2 - offsetY];

      const background = mapCoords(image.dimensions, (coord) => {
        const pointAngle = calculateAngle(coord, center);
        const newH = (pointAngle * groupCount + animationProgress * 360) % 360;
        return colorFromHue(newH);
      });

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
        background,
        foreground,
      });
    }),
});
