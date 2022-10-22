import { buildEffect, Coord } from '../domain/types';
import { combineImages } from '../domain/utils/canvas';
import { calculateAngle, colorFromHue } from '../domain/utils/color';
import { mapCoords, mapFrames } from '../domain/utils/image';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const pinwheelPartyBackground = buildEffect({
  name: 'Pinwheel Party Background',
  description: 'Create a pinwheel of party colors behind the image',
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
  ] as const,
  fn: ({ image, parameters: [groupCount, offsetX, offsetY] }) =>
    mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const [width, height] = image.dimensions;
      const center: Coord = [width / 2 + offsetX, height / 2 - offsetY];

      const background = mapCoords(image.dimensions, (coord) => {
        const pointAngle = calculateAngle(coord, center);
        const newH = (pointAngle * groupCount + animationProgress * 360) % 360;
        return colorFromHue(newH);
      });

      return combineImages({
        dimensions: image.dimensions,
        background,
        foreground: frame,
      });
    }),
});
