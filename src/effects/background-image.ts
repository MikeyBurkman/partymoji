import { buildEffect } from '../domain/types';
import { combineImages, frameToCanvas } from '../domain/utils/canvas';
import { resizeImage, mapFrames } from '../domain/utils/image';
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
  ] as const,
  fn: ({ image, parameters: [otherImagePreResize, type] }) => {
    const otherImage = resizeImage({
      image: otherImagePreResize.image,
      newWidth: image.dimensions[0],
      newHeight: image.dimensions[1],
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
