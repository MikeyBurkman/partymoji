import { buildEffect } from '../domain/types';
import { resizeImage as resizeImageUtil } from '../domain/utils/image';
import { checkboxParam } from '../params/checkboxParam';
import { intParam } from '../params/intParam';

export const resizeImage = buildEffect({
  name: 'Resize Image',
  description: 'Change the absolute dimensions of the image.',
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
    checkboxParam({
      name: 'Keep scale',
      description:
        'If checked, the image will be stretched to fit the new dimensions',
      defaultValue: false,
    }),
  ] as const,
  fn: ({ image, parameters: [resizeToWidth, resizeToHeight, keepScale] }) => {
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
      keepScale,
    });
  },
});
