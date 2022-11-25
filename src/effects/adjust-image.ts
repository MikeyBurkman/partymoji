import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyFilter } from '../domain/utils/canvas';
import { resizeImage, mapFrames } from '../domain/utils/image';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const adjustImage = buildEffect({
  name: 'Adjust Image',
  description: 'Change the dimensions, brightness, contrast etc.',
  params: [
    intParam({
      name: 'Width',
      description:
        'Set to 0 to not change the width. If height is changed, the image will keep the same aspect ratio.',
      defaultValue: (image) => (image ? image.dimensions[0] : 0),
      min: 0,
    }),
    intParam({
      name: 'Height',
      description:
        'Set to 0 to not change the height. If width is changed, the image will keep the same aspect ratio.',
      defaultValue: (image) => (image ? image.dimensions[1] : 0),
      min: 0,
    }),
    sliderParam({
      name: 'Brightness',
      min: -100,
      max: 100,
      step: 5,
      defaultValue: 0,
    }),
    sliderParam({
      name: 'Contrast',
      min: -100,
      max: 100,
      step: 5,
      defaultValue: 0,
    }),
    sliderParam({
      name: 'Saturation',
      min: -100,
      max: 100,
      step: 5,
      defaultValue: 0,
    }),
  ] as const,
  fn: ({
    image,
    parameters: [
      resizeToWidth,
      resizeToHeight,
      brightness,
      contrast,
      saturation,
    ],
  }) => {
    const [oldWidth, oldHeight] = image.dimensions;

    const hasScaleChange = resizeToWidth > 0 || resizeToHeight > 0;

    // If we're changing one of width/height, then we'll scale the other one to match the same aspect ratio.
    const newWidth =
      hasScaleChange && resizeToWidth === 0
        ? Math.ceil((oldWidth / oldHeight) * resizeToHeight)
        : resizeToWidth;
    const newHeight =
      hasScaleChange && resizeToHeight === 0
        ? Math.ceil((oldHeight / oldWidth) * resizeToWidth)
        : resizeToHeight;

    // Use this to figure out when we should optimally resize the image
    const isBiggerImage = newWidth * newHeight > oldWidth * oldHeight;

    let currImage = image;

    // If making a smaller image, might as well do the brightness/contrast after making it smaller
    if (hasScaleChange && !isBiggerImage) {
      currImage = resizeImage({
        image: currImage,
        newWidth,
        newHeight,
        keepScale: false,
      });
    }

    currImage = mapFrames(currImage, (imageData) =>
      applyCanvasFromFrame({
        dimensions: currImage.dimensions,
        frame: imageData,
        preEffect: (canvasData) =>
          applyFilter(canvasData, {
            brightness: brightness + 100,
            contrast: contrast + 100,
            saturation: saturation + 100,
          }),
      })
    );

    // If the image will be made bigger, we'll run that after adjusting the brightness/contrast
    if (hasScaleChange && isBiggerImage) {
      currImage = resizeImage({
        image: currImage,
        newWidth,
        newHeight,
        keepScale: false,
      });
    }

    return currImage;
  },
});
