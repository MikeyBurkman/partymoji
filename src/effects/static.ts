import { colorUtil, imageUtil } from '~/domain/utils';
import { radioParam, sliderParam } from '~/params';
import { buildEffect } from './utils';

export const staticc = buildEffect({
  name: 'Static',
  group: 'Misc',
  description: 'Adds random static to each frame the image',
  params: [
    radioParam<'background' | 'foreground'>({
      name: 'Type',
      description: 'Whether to apply the party to the foreground or background',
      defaultValue: 'background',
      options: [
        {
          name: 'Background',
          value: 'background',
        },
        {
          name: 'Foreground',
          value: 'foreground',
        },
      ],
    }),
    sliderParam({
      name: 'Strength',
      description: 'Higher number increases the amount of static pixels',
      defaultValue: 25,
      min: 5,
      max: 100,
      step: 5,
    }),
  ] as const,
  fn: imageUtil.mapImage(
    ({ coord, getSrcPixel, parameters: [type, strength], random }) => {
      const src = getSrcPixel(coord);

      const isBackground = colorUtil.isTransparent(src);

      if (type === 'foreground' ? isBackground : !isBackground) {
        return src;
      }

      if (isBackground && type === 'background') {
        const inverse = Math.ceil(random() * 100) < strength;
        const grey = Math.ceil(random() * 255);

        return inverse ? [grey, grey, grey, 255] : src;
      }

      const isStatic = Math.ceil(random() * 100) < strength;
      const grey = Math.ceil(random() * 255);

      return isStatic ? [grey, grey, grey, src[3]] : src;
    }
  ),
});
