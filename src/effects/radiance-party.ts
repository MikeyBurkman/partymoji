import { buildEffect } from '../domain/types';
import { isTransparent, shiftTowardsHue } from '../domain/utils/color';
import { mapImageWithPrecompute } from '../domain/utils/image';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const radianceParty = buildEffect({
  name: 'Radiance Party',
  description: 'Radiate party colors out in rings',
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
    }),
    sliderParam({
      name: 'Amount',
      description: 'How strong the effect is.',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 75,
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
  fn: mapImageWithPrecompute(
    ({ dimensions: [width, height] }) => ({
      centerX: width / 2,
      centerY: height / 2,
      maxDist: Math.sqrt(
        (width / 2) * (width / 2) + (height / 2) * (height / 2)
      ),
    }),
    ({
      computed: { centerX, centerY, maxDist },
      coord,
      animationProgress,
      parameters: [groupCount, amount, offsetX, offsetY],
      getSrcPixel,
    }) => {
      const src = getSrcPixel(coord);

      const isBackground = isTransparent(src);

      if (isBackground) {
        return src;
      }

      const [x, y] = coord;
      const xRelCenter = x - centerX - offsetX;
      const yRelCenter = y - centerY + offsetY;

      const distFromCenter = Math.sqrt(
        yRelCenter * yRelCenter + xRelCenter * xRelCenter
      );

      const newH =
        ((1 - distFromCenter / maxDist) * 360 * groupCount +
          360 * animationProgress) %
        360;

      return shiftTowardsHue(src, newH, amount);
    }
  ),
});
