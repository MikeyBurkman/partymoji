import { imageUtil } from '~/domain/utils';
import { floatParam } from '~/params';
import { buildEffect } from './utils';

export const doubleVision = buildEffect({
  name: 'Double Vision',
  group: 'Misc',
  description: 'See double',
  requiresAnimation: true,
  params: [
    floatParam({ name: 'Amplitude', defaultValue: 10, min: 0 }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({ animationProgress, parameters: [amplitude] }) => ({
      xOffset: amplitude * Math.sin(-2 * Math.PI * animationProgress),
    }),
    ({ computed: { xOffset }, coord: [x, y], getSrcPixel }) => {
      const dir = x % 2 === 0 ? -1 : 1;
      return getSrcPixel([x + Math.round(dir * xOffset), y]);
    },
  ),
});
