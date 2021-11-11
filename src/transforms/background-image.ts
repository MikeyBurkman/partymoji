import { buildTransform } from '../domain/types';
import {
  getPixel,
  isTransparent,
  mapCoords,
  mapFrames,
  resizeImage,
} from '../domain/utils';
import { imagePickerParam } from '../params/imagePickerParam';
import { radioParam } from '../params/radioParam';

export const backgroundImage = buildTransform({
  name: 'Background Image',
  description: 'Select another image to be used as a background or foreground',
  params: [
    imagePickerParam({
      name: 'Image',
    }),
    radioParam({
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
  fn: ({ image, parameters }) => {
    const otherImage = resizeImage({
      image: parameters[0].image,
      newWidth: image.dimensions[0],
      newHeight: image.dimensions[1],
    });
    const type = parameters[1];

    return mapFrames(image, (data, frameIndex) => {
      return mapCoords(image.dimensions, (coord) => {
        const frameProgress = frameIndex / image.frames.length;
        const otherImageFrame = Math.floor(
          frameProgress * otherImage.frames.length
        );
        const otherImageSrc = getPixel({
          image: otherImage,
          frameIndex: otherImageFrame,
          coord,
        });

        const src = getPixel({
          image,
          frameIndex,
          coord,
        });

        if (type === 'background') {
          // Only print the other image if the src image is transparent here
          return isTransparent(src) ? otherImageSrc : src;
        } else {
          return isTransparent(otherImageSrc) ? src : otherImageSrc;
        }
      });
    });
  },
});
