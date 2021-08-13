import { buildTransform } from '../types';
import { resizeImage } from '../utils';
import { intParam } from '../../params/intParam';

export const resize = buildTransform({
  name: 'Resize',
  params: [
    intParam({
      name: 'Width',
      defaultValue: 128,
      min: 1,
    }),
    intParam({
      name: 'Height',
      defaultValue: 128,
      min: 1,
    }),
  ] as const,
  fn: ({ image, parameters }) => {
    const [newWidth, newHeight] = parameters;
    return resizeImage({
      image,
      newWidth,
      newHeight,
    });
  },
});
