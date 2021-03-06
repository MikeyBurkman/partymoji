import { buildEffect } from '../domain/types';
import { resizeImage as resizeImageUtil } from '../domain/utils';
import { intParam } from '../params/intParam';

export const resizeImage = buildEffect({
  name: 'Resize Image',
  description: 'Change the dimensions of the image without scaling',
  secondaryDescription:
    'If bigger than original, the extra space will be transparent. ' +
    'If smaller, the image will be cropped. ',
  params: [
    intParam({
      name: 'Width',
      description:
        'Set to 0 when height is set to non-zero to keep the same aspect ratio',
      defaultValue: (image) => (image ? image.dimensions[0] : 0),
      min: 0,
    }),
    intParam({
      name: 'Height',
      description:
        'Set to 0 when width is set to non-zero to keep the same aspect ratio',
      defaultValue: (image) => (image ? image.dimensions[1] : 0),
      min: 0,
    }),
  ] as const,
  fn: ({ image, parameters: [resizeToWidth, resizeToHeight] }) => {
    const [oldWidth, oldHeight] = image.dimensions;
    const newWidth =
      resizeToWidth === 0
        ? Math.ceil((oldWidth / oldHeight) * resizeToHeight)
        : resizeToWidth;
    const newHeight =
      resizeToHeight === 0
        ? Math.ceil((oldHeight / oldWidth) * resizeToWidth)
        : resizeToHeight;
    return resizeImageUtil({
      image,
      newWidth,
      newHeight,
    });
  },
});
