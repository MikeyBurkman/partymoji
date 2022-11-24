import { buildEffect } from '../domain/types';
import { combineImages, frameToCanvas } from '../domain/utils/canvas';
import { resizeImage, mapFrames } from '../domain/utils/image';
import { checkboxParam } from '../params/checkboxParam';
import { imagePickerParam } from '../params/imagePickerParam';
import { radioParam } from '../params/radioParam';

export const backgroundImage = buildEffect({
  name: 'Background Image',
  description: 'Select another image to be used as a background or foreground',
  secondaryDescription:
    'If the selected image is animated, this will speed up/slow down ' +
    'the animation to match the original image',
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
    checkboxParam({
      name: 'Scale Image',
      defaultValue: false,
      description:
        'If true, the new image will be scaled to fit the dimensions of the original image',
    }),
  ] as const,
  fn: ({ image, parameters: [otherImagePreResize, type, keepScale] }) => {
    const otherImage = resizeImage({
      image: otherImagePreResize.image,
      newWidth: image.dimensions[0],
      newHeight: image.dimensions[1],
      keepScale,
    });

    return mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;

      const thisFrameCanvas = frameToCanvas({
        dimensions: image.dimensions,
        frame,
      });

      const otherImageFrameIndex = Math.floor(
        animationProgress * otherImage.frames.length
      );
      const otherFrameCanvas = frameToCanvas({
        dimensions: otherImage.dimensions,
        frame: otherImage.frames[otherImageFrameIndex],
      });

      return combineImages({
        dimensions: image.dimensions,
        background: type === 'background' ? otherFrameCanvas : thisFrameCanvas,
        foreground: type === 'background' ? thisFrameCanvas : otherFrameCanvas,
      });
    });
  },
});
