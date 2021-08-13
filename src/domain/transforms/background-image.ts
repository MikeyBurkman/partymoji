import { dropdownParam } from '../../params/dropdownParam';
import { imagePickerParam } from '../../params/imagePickerParam';
import { buildTransform } from '../types';
import {
  isTransparent,
  getPixelFromSource,
  mapFrames,
  mapCoords,
  resizeImage,
} from '../utils';

export const backgroundImage = buildTransform({
  name: 'Background Image',
  params: [
    imagePickerParam({
      name: 'Image',
    }),
    dropdownParam({
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
      ] as const,
    }),
  ] as const,
  fn: ({ image, parameters }) => {
    const otherImage = resizeImage({
      image: parameters[0].image,
      newWidth: image.dimensions[0],
      newHeight: image.dimensions[1],
    });
    const type = parameters[1];

    return mapFrames(image, (data) => {
      return mapCoords(image.dimensions, (coord) => {
        const src = getPixelFromSource(image.dimensions, data, coord);
        const otherImageSrc = getPixelFromSource(
          otherImage.dimensions,
          otherImage.frames[0].data,
          coord
        );

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
