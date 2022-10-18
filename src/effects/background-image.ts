import { buildEffect } from '../domain/types';
import { isTransparent } from '../domain/utils/color';
import {
  mapImageWithPrecompute,
  getPixel,
  resizeImage,
} from '../domain/utils/image';
import { imagePickerParam } from '../params/imagePickerParam';
import { radioParam } from '../params/radioParam';

export const backgroundImage = buildEffect({
  name: 'Background Image',
  description: 'Select another image to be used as a background or foreground',
  params: [
    imagePickerParam({
      name: 'Image',
    }),
    radioParam<'background' | 'foreground'>({
      name: 'Type',
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
  ] as const,
  fn: mapImageWithPrecompute(
    ({ image: { dimensions }, parameters: [otherImagePreResize, type] }) => {
      const otherImage = resizeImage({
        image: otherImagePreResize.image,
        newWidth: dimensions[0],
        newHeight: dimensions[1],
      });
      return { otherImage, type };
    },
    ({
      coord,
      animationProgress,
      computed: { otherImage, type },
      getSrcPixel,
    }) => {
      const otherImageFrame = Math.floor(
        animationProgress * otherImage.frames.length
      );
      const otherImageSrc = getPixel({
        image: otherImage,
        frameIndex: otherImageFrame,
        coord,
      });

      const src = getSrcPixel(coord);

      if (type === 'background') {
        // Only print the other image if the src image is transparent here
        return isTransparent(src) ? otherImageSrc : src;
      } else {
        return isTransparent(otherImageSrc) ? src : otherImageSrc;
      }
    }
  ),
});
