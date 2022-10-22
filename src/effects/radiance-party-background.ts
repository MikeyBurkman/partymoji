import { buildEffect } from '../domain/types';
import { combineImages } from '../domain/utils/canvas';
import { colorFromHue } from '../domain/utils/color';
import { mapCoords, mapFrames } from '../domain/utils/image';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const radiancePartyBackground = buildEffect({
  name: 'Radiance Party Background',
  description: 'Radiate party colors out in rings',
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
      description: 'Change the horizontal center of the radiance',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      description: 'Change the vertical center of the radiance',
      defaultValue: 0,
    }),
  ] as const,
  fn: ({ image, parameters: [groupCount, offsetX, offsetY] }) =>
    mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const [width, height] = image.dimensions;

      const centerX = width / 2;
      const centerY = height / 2;
      const maxDist = Math.sqrt(
        (width / 2) * (width / 2) + (height / 2) * (height / 2)
      );

      const background = mapCoords(image.dimensions, ([x, y]) => {
        const xRelCenter = x - centerX - offsetX;
        const yRelCenter = y - centerY + offsetY;

        const distFromCenter = Math.sqrt(
          yRelCenter * yRelCenter + xRelCenter * xRelCenter
        );

        const newH =
          ((1 - distFromCenter / maxDist) * 360 * groupCount +
            360 * animationProgress) %
          360;

        return colorFromHue(newH);
      });

      return combineImages({
        dimensions: image.dimensions,
        background,
        foreground: frame,
      });
    }),
});
