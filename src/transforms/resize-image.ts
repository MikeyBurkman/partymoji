import { buildTransform } from '../domain/types';
import { resizeImage as resizeImageUtil } from '../domain/utils';
import { intParam } from '../params/intParam';

export const resizeImage = buildTransform({
  name: 'Resize Image',
  description:
    'Change the dimensions of the image. ' +
    'If bigger than original, the extra space will be transparent. ' +
    'If smaller, the image will be cropped. ',
  params: [
    intParam({ name: 'Width', defaultValue: 128, min: 0 }),
    intParam({ name: 'Height', defaultValue: 128, min: 0 }),
  ],
  fn: ({ image, parameters }) =>
    resizeImageUtil({
      image,
      newWidth: parameters[0],
      newHeight: parameters[1],
    }),
});
