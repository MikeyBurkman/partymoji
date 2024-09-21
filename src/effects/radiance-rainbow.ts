import { colorUtil, imageUtil } from '~/domain/utils';
import { intParam, sliderParam } from '~/params';
import { buildEffect } from './utils';

export const radianceRainbow = buildEffect({
  name: 'Radiance Rainbow',
  group: 'Party',
  description: 'Radiate rainbow colors out in rings',
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
    }),
    sliderParam({
      name: 'Strength',
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
  fn: imageUtil.mapImageWithPrecompute(
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
      parameters: [groupCount, strength, offsetX, offsetY],
      getSrcPixel,
    }) => {
      const src = getSrcPixel(coord);

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

      return colorUtil.shiftTowardsHue(src, newH, strength);
    }
  ),
});
