import { buildTransform } from '../domain/types';
import { resizeImage } from '../domain/utils';
import { intParam } from '../params/intParam';

export const resize = buildTransform({
  name: 'Resize',
  description: 'Resize the image. Will grow/shrink the image.',
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
