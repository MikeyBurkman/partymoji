import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyFilter } from '../domain/utils/canvas';
import { changeFrameCount, scaleImage, mapFrames } from '../domain/utils/image';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const adjustImage = buildEffect({
  name: 'Adjust Image',
  description:
    'Change the length of the animation, the dimensions, brightness, etc.',
  secondaryDescription: 'Leave a parameter at 0 if you want to not change it',
  params: [
    sliderParam({
      name: 'Number of Frames',
      description:
        'Set how many frames of animation there will be. Set to 0 to not change the current frame count.',
      defaultValue: (image) => (image ? image.frames.length : 0),
      min: 0,
      max: 60,
    }),
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
      frameCount,
      resizeToWidth,
      resizeToHeight,
      brightness,
      contrast,
      saturation,
    ],
  }) => {
    const hasFrameCount = frameCount !== 0;

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

    if (hasFrameCount && frameCount < image.frames.length) {
      // Reducing the number of frames, so do that first so we have fewer pixels to change
      currImage = changeFrameCount(currImage, frameCount);
    }

    // If making a smaller image, might as well do the brightness/contrast after making it smaller
    if (hasScaleChange && !isBiggerImage) {
      currImage = scaleImage({
        image: currImage,
        newWidth,
        newHeight,
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
      currImage = scaleImage({ image: currImage, newWidth, newHeight });
    }

    // Finally change the number of frames if we're adding frames
    if (hasFrameCount && frameCount > image.frames.length) {
      currImage = changeFrameCount(currImage, frameCount);
    }

    return currImage;
  },
});
